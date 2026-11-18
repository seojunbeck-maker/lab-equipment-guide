begin;

alter table public.equipment
    add column if not exists english_name text,
    add column if not exists aliases text[] not null default '{}'::text[],
    add column if not exists key_features text;

comment on column public.equipment.english_name is
    'Standard English name used for dictionary search.';
comment on column public.equipment.aliases is
    'Additional Korean or English names used for normalized search.';
comment on column public.equipment.key_features is
    'Short visual characteristics shown with image-analysis candidates.';

with metadata(name, english_name, aliases) as (
    values
        ('가변저항기', 'Rheostat', array['variable resistor']::text[]),
        ('가스 포집병', 'Gas jar', array['gas collection jar', '집기병']::text[]),
        ('가지 달린 플라스크', 'Side-arm flask', array['distillation flask', 'side arm flask']::text[]),
        ('감압 플라스크', 'Filtering flask', array['Buchner flask', 'vacuum flask', 'filter flask']::text[]),
        ('고압증기멸균기', 'Autoclave', array['steam sterilizer']::text[]),
        ('광학 현미경', 'Optical microscope', array['compound microscope', '광학현미경']::text[]),
        ('광학대', 'Optical bench', array[]::text[]),
        ('내화학 장갑', 'Chemical-resistant gloves', array['chemical resistant gloves']::text[]),
        ('눈금자', 'Ruler', array['metric ruler']::text[]),
        ('도가니', 'Crucible', array[]::text[]),
        ('둥근바닥 플라스크', 'Round-bottom flask', array['round bottom flask']::text[]),
        ('디지털 멀티미터', 'Digital multimeter', array['multimeter', 'DMM']::text[]),
        ('레이저 광원', 'Laser source', array['laser light source']::text[]),
        ('리비히 냉각기', 'Liebig condenser', array['condenser']::text[]),
        ('마이크로미터', 'Micrometer', array['micrometer screw gauge']::text[]),
        ('마이크로튜브', 'Microcentrifuge tube', array['microtube', 'Eppendorf tube']::text[]),
        ('막자사발과 막자', 'Mortar and pestle', array['mortar pestle']::text[]),
        ('메스', 'Scalpel', array['dissection scalpel']::text[]),
        ('메스 플라스크', 'Volumetric flask', array['measuring flask', '메스플라스크']::text[]),
        ('메스실린더', 'Graduated cylinder', array['measuring cylinder', '메스 실린더', '눈금 실린더']::text[]),
        ('멸균 면봉', 'Sterile swab', array['culture swab']::text[]),
        ('버니어 캘리퍼스', 'Vernier caliper', array['vernier calipers']::text[]),
        ('보안경', 'Safety goggles', array['safety glasses']::text[]),
        ('볼록렌즈', 'Convex lens', array['converging lens']::text[]),
        ('분액 깔때기', 'Separatory funnel', array['separating funnel']::text[]),
        ('분젠 버너', 'Bunsen burner', array[]::text[]),
        ('뷰렛', 'Burette', array['buret']::text[]),
        ('뷰흐너 깔때기', 'Buchner funnel', array['vacuum funnel']::text[]),
        ('비커', 'Beaker', array['glass beaker', '유리 비커']::text[]),
        ('삼각 프리즘', 'Triangular prism', array['glass prism']::text[]),
        ('삼각 플라스크', 'Erlenmeyer flask', array['conical flask', '삼각플라스크', '에를렌마이어 플라스크']::text[]),
        ('삼발이', 'Tripod stand', array['laboratory tripod']::text[]),
        ('생물안전작업대', 'Biological safety cabinet', array['biosafety cabinet', 'BSC']::text[]),
        ('세척병', 'Wash bottle', array['washing bottle']::text[]),
        ('세포 배양 플라스크', 'Cell culture flask', array['tissue culture flask', 'T-flask']::text[]),
        ('쇠그물', 'Wire gauze', array['wire mesh']::text[]),
        ('스탠드와 클램프', 'Retort stand and clamp', array['ring stand and clamp']::text[]),
        ('스포이드', 'Dropper', array['Pasteur pipette', 'dropping pipette']::text[]),
        ('슬라이드 글라스', 'Microscope slide', array['glass slide']::text[]),
        ('시계접시', 'Watch glass', array[]::text[]),
        ('시약병', 'Reagent bottle', array['chemical bottle']::text[]),
        ('시험관', 'Test tube', array[]::text[]),
        ('시험관 집게', 'Test tube holder', array['test tube clamp']::text[]),
        ('알코올 램프', 'Alcohol lamp', array['spirit lamp']::text[]),
        ('약숟가락', 'Laboratory spatula', array['scoopula', 'spatula']::text[]),
        ('역학용 수레', 'Dynamics cart', array['mechanics cart']::text[]),
        ('오목렌즈', 'Concave lens', array['diverging lens']::text[]),
        ('온도계', 'Thermometer', array['laboratory thermometer']::text[]),
        ('용수철저울', 'Spring scale', array['Newton meter', 'spring balance']::text[]),
        ('워터배스', 'Water bath', array['laboratory water bath']::text[]),
        ('원심분리기', 'Centrifuge', array['laboratory centrifuge']::text[]),
        ('유리 깔때기', 'Glass funnel', array['filter funnel']::text[]),
        ('유리 도말봉', 'Glass spreader', array['cell spreader', 'hockey stick spreader']::text[]),
        ('유리 막대', 'Glass stirring rod', array['glass rod', 'stirring rod']::text[]),
        ('전류계', 'Ammeter', array['current meter']::text[]),
        ('전압계', 'Voltmeter', array['voltage meter']::text[]),
        ('전자저울', 'Electronic balance', array['digital balance', '전자 저울']::text[]),
        ('접안 마이크로미터', 'Eyepiece micrometer', array['ocular micrometer']::text[]),
        ('접종 루프', 'Inoculating loop', array['inoculation loop']::text[]),
        ('접종 바늘', 'Inoculating needle', array['inoculation needle']::text[]),
        ('증발 접시', 'Evaporating dish', array['evaporation dish']::text[]),
        ('직류 전원 공급 장치', 'DC power supply', array['direct current power supply']::text[]),
        ('철제 스탠드', 'Retort stand', array['ring stand']::text[]),
        ('초시계', 'Stopwatch', array['stop watch']::text[]),
        ('추와 추걸이', 'Slotted weights and hanger', array['weight set', 'mass hanger']::text[]),
        ('커버 글라스', 'Cover slip', array['coverslip', 'cover glass']::text[]),
        ('페트리 접시', 'Petri dish', array['culture dish']::text[]),
        ('표본병', 'Specimen jar', array['sample jar']::text[]),
        ('피펫', 'Pipette', array['pipet', 'micropipette', 'micro pipette']::text[]),
        ('항온 배양기', 'Laboratory incubator', array['incubator']::text[]),
        ('해부 가위', 'Dissecting scissors', array['dissection scissors']::text[]),
        ('해부 접시', 'Dissecting tray', array['dissection tray']::text[]),
        ('해부 핀셋', 'Dissecting forceps', array['dissection forceps', 'tweezers']::text[]),
        ('혈구계산판', 'Hemocytometer', array['haemocytometer', 'counting chamber']::text[])
)
update public.equipment as equipment
set
    english_name = metadata.english_name,
    aliases = metadata.aliases
from metadata
where equipment.name = metadata.name;

update public.equipment
set key_features = rtrim(
        split_part(
            regexp_replace(structure, '\s+', ' ', 'g'),
            '.',
            1
        )
    ) || '.'
where
    (key_features is null or btrim(key_features) = '')
    and structure is not null
    and btrim(structure) <> '';

with features(name, key_features) as (
    values
        ('비커', '원통형 몸체, 넓은 입구, 액체를 따르는 주둥이와 대략적인 눈금이 있다.'),
        ('메스실린더', '가늘고 긴 원통형 몸체, 촘촘한 부피 눈금, 넘어짐을 막는 넓은 받침이 있다.'),
        ('삼각 플라스크', '넓고 평평한 바닥에서 좁은 목으로 이어지는 원뿔형 몸체를 가진다.'),
        ('메스 플라스크', '둥근 몸통과 길고 가는 목, 정확한 부피를 나타내는 하나의 표선이 있다.'),
        ('시험관', '가늘고 긴 원통형 관이며 입구 반대쪽 끝이 둥글게 막혀 있다.'),
        ('스포이드', '끝이 가는 관과 눌러 액체를 흡입하는 고무 벌브가 결합되어 있다.'),
        ('뷰렛', '길고 균일한 유리관에 촘촘한 눈금이 있고 아래쪽에 콕과 가는 배출구가 있다.'),
        ('피펫', '가늘고 긴 관 또는 조절식 본체로 이루어지며 소량의 액체를 정밀하게 옮긴다.'),
        ('광학 현미경', '접안렌즈, 여러 대물렌즈, 재물대, 조동·미동 나사와 아래쪽 광원이 있다.'),
        ('페트리 접시', '바닥이 평평하고 낮은 원형 접시와 지름이 조금 큰 덮개가 한 쌍을 이룬다.'),
        ('전자저울', '평평한 측정 팬과 디지털 표시창, 영점 조절 버튼을 갖춘다.'),
        ('알코올 램프', '연료를 담는 작은 용기, 면 심지, 금속 심지관과 불꽃을 끄는 덮개가 있다.'),
        ('온도계', '가는 눈금 몸체와 온도 감지부가 있으며 액주 또는 디지털 화면으로 값을 표시한다.'),
        ('분액 깔때기', '마개가 있는 배 모양 몸체와 아래쪽의 유량 조절 꼭지, 가는 배출관이 있다.'),
        ('둥근바닥 플라스크', '구형 몸통과 하나 이상의 목을 가진 내열 유리 용기로 스스로 세울 수 없다.'),
        ('시계접시', '시계 유리처럼 얕고 둥글게 오목한 얇은 유리판이다.'),
        ('증발 접시', '입구가 넓고 얕은 내열 도자기 그릇이며 작은 주둥이가 있다.'),
        ('유리 깔때기', '넓은 원뿔형 윗부분과 길고 가는 관이 이어진 투명 유리 기구이다.'),
        ('원심분리기', '뚜껑이 있는 본체 안에 고속 회전 로터와 시료 튜브 홀더가 있다.'),
        ('분젠 버너', '무거운 받침, 수직 금속관, 가스 유입구와 공기 조절 구멍이 있다.')
)
update public.equipment as equipment
set key_features = features.key_features
from features
where equipment.name = features.name;

alter table public.equipment enable row level security;
revoke all on table public.equipment from anon, authenticated;
grant select on table public.equipment to anon, authenticated;

commit;
