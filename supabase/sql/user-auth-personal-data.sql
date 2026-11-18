begin;

-- Stop public access before ownership is added.
revoke all on table public.favorites from anon, authenticated;
revoke all on table public.analysis_history from anon, authenticated;

drop policy if exists favorites_select_public on public.favorites;
drop policy if exists favorites_insert_public on public.favorites;
drop policy if exists favorites_delete_public on public.favorites;
drop policy if exists favorites_select_own on public.favorites;
drop policy if exists favorites_insert_own on public.favorites;
drop policy if exists favorites_delete_own on public.favorites;
drop policy if exists analysis_history_select_public on public.analysis_history;
drop policy if exists analysis_history_insert_public on public.analysis_history;
drop policy if exists analysis_history_delete_public on public.analysis_history;
drop policy if exists analysis_history_select_own on public.analysis_history;
drop policy if exists analysis_history_insert_own on public.analysis_history;
drop policy if exists analysis_history_delete_own on public.analysis_history;

alter table public.favorites
    add column if not exists user_id uuid;

alter table public.analysis_history
    add column if not exists user_id uuid;

-- The project had no shared rows when this migration was prepared. Any
-- anonymous legacy rows have no safe owner and must not become visible later.
delete from public.favorites where user_id is null;
delete from public.analysis_history where user_id is null;

alter table public.favorites
    alter column user_id set default auth.uid(),
    alter column user_id set not null;

alter table public.analysis_history
    alter column user_id set default auth.uid(),
    alter column user_id set not null;

do $$
begin
    if not exists (
        select 1 from pg_constraint
        where conname = 'favorites_user_id_fkey'
          and conrelid = 'public.favorites'::regclass
    ) then
        alter table public.favorites
            add constraint favorites_user_id_fkey
            foreign key (user_id) references auth.users(id) on delete cascade;
    end if;

    if not exists (
        select 1 from pg_constraint
        where conname = 'analysis_history_user_id_fkey'
          and conrelid = 'public.analysis_history'::regclass
    ) then
        alter table public.analysis_history
            add constraint analysis_history_user_id_fkey
            foreign key (user_id) references auth.users(id) on delete cascade;
    end if;
end
$$;

alter table public.favorites
    drop constraint if exists favorites_equipment_name_key,
    drop constraint if exists favorites_user_equipment_key;

alter table public.favorites
    add constraint favorites_user_equipment_key
    unique (user_id, equipment_name);

alter table public.analysis_history
    drop constraint if exists analysis_history_payload_check;

alter table public.analysis_history
    add constraint analysis_history_payload_check check (
        (
            record_type = 'analysis'
            and equipment_name is not null
            and char_length(btrim(equipment_name)) between 1 and 100
            and confidence is not null
            and confidence between 0 and 100
            and search_query is null
        )
        or
        (
            record_type = 'search'
            and equipment_name is null
            and confidence is null
            and search_query is not null
            and char_length(btrim(search_query)) between 1 and 200
        )
    );

create index if not exists favorites_user_created_idx
    on public.favorites (user_id, created_at desc);

create index if not exists analysis_history_user_created_idx
    on public.analysis_history (user_id, created_at desc);

alter table public.favorites enable row level security;
alter table public.analysis_history enable row level security;

grant select, insert, delete on table public.favorites to authenticated;
grant select, insert, delete on table public.analysis_history to authenticated;

revoke all on sequence public.favorites_id_seq from anon;
revoke all on sequence public.analysis_history_id_seq from anon;
grant usage, select on sequence public.favorites_id_seq to authenticated;
grant usage, select on sequence public.analysis_history_id_seq to authenticated;

create policy favorites_select_own
on public.favorites for select
to authenticated
using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);

create policy favorites_insert_own
on public.favorites for insert
to authenticated
with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);

create policy favorites_delete_own
on public.favorites for delete
to authenticated
using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);

create policy analysis_history_select_own
on public.analysis_history for select
to authenticated
using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);

create policy analysis_history_insert_own
on public.analysis_history for insert
to authenticated
with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);

create policy analysis_history_delete_own
on public.analysis_history for delete
to authenticated
using (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
);

-- Complete the representative school-equipment set without duplicating rows.
insert into public.equipment (
    name,
    english_name,
    aliases,
    category,
    purpose,
    structure,
    usage,
    caution,
    key_features,
    image_url
)
select
    '시험관대',
    'Test tube rack',
    array['tube rack', '시험관 랙', '시험관 받침대']::text[],
    '보관 및 지지 기구',
    '시험관을 세워 보관하거나 여러 시험관의 반응을 순서대로 비교할 때 사용한다.',
    '나무, 금속 또는 플라스틱 판에 시험관이 들어가는 여러 개의 구멍과 받침판이 연결된 구조이다.',
    E'1. 깨끗하고 평평한 곳에 시험관대를 놓는다.\n2. 시험관의 바닥이 아래로 향하도록 구멍에 넣는다.\n3. 실험 순서에 맞게 시험관 위치를 구분한다.\n4. 사용 후 오염을 닦고 완전히 말린다.',
    E'• 뜨거운 시험관은 내열 여부를 확인한 뒤 꽂는다.\n• 시험관대가 기울거나 흔들리지 않는지 확인한다.\n• 깨진 시험관은 꽂지 않는다.',
    '여러 개의 원형 구멍이 일정하게 배열되어 있고 시험관을 세로로 세울 수 있는 받침 구조가 있다.',
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/A_laboratory_apparatus_for_holding_test_tubes.jpg/960px-A_laboratory_apparatus_for_holding_test_tubes.jpg'
where not exists (
    select 1 from public.equipment
    where regexp_replace(lower(name), '\s+', '', 'g') = '시험관대'
);

update public.equipment
set aliases = (
    select array_agg(distinct value order by value)
    from unnest(coalesce(aliases, '{}'::text[]) || array['깔때기']) as values_list(value)
)
where name = '유리 깔때기';

update public.equipment
set aliases = (
    select array_agg(distinct value order by value)
    from unnest(
        coalesce(aliases, '{}'::text[]) || array['집게', 'test tube tongs']
    ) as values_list(value)
)
where name = '시험관 집게';

commit;
