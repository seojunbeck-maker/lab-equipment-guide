export const EQUIPMENT_GROUP_CATEGORIES = [
    "유리기구",
    "측정기구",
    "가열기구",
    "분리기구",
    "배양기구",
    "관찰기구",
    "기타"
];

export function normalizeEquipmentSearch(value) {
    return String(value || "")
        .normalize("NFKC")
        .toLocaleLowerCase("ko-KR")
        .replace(/[\s·_\-()/]+/g, "")
        .trim();
}

export function normalizeAliases(value) {
    if (Array.isArray(value)) {
        return value
            .map(alias => String(alias || "").trim())
            .filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split(",")
            .map(alias => alias.trim())
            .filter(Boolean);
    }

    return [];
}

export function getEquipmentGroupCategory(category) {
    const value = String(category || "");

    if (/측정|질량|부피|시간|힘|정밀 액체/.test(value)) {
        return "측정기구";
    }

    if (/가열|고온|온도 조절|증발|농축/.test(value)) {
        return "가열기구";
    }

    if (/분리|여과|증류|환류|원심/.test(value)) {
        return "분리기구";
    }

    if (/배양|접종|멸균|무균/.test(value)) {
        return "배양기구";
    }

    if (/관찰|현미경|광학/.test(value)) {
        return "관찰기구";
    }

    if (/유리/.test(value)) {
        return "유리기구";
    }

    return "기타";
}

export function addEquipmentSearchMetadata(equipment) {
    return {
        ...equipment,
        aliases: normalizeAliases(equipment?.aliases),
        group_category: getEquipmentGroupCategory(equipment?.category)
    };
}

export function getEquipmentSearchTerms(equipment) {
    return [
        equipment?.name,
        equipment?.english_name,
        ...normalizeAliases(equipment?.aliases)
    ]
        .map(normalizeEquipmentSearch)
        .filter(Boolean);
}

export function equipmentMatchesSearch(equipment, query) {
    const normalizedQuery = normalizeEquipmentSearch(query);

    if (!normalizedQuery) {
        return true;
    }

    return getEquipmentSearchTerms(equipment).some(
        term => term.includes(normalizedQuery)
    );
}

export function findEquipmentBySearch(equipment, query) {
    const normalizedQuery = normalizeEquipmentSearch(query);

    if (!normalizedQuery) {
        return null;
    }

    const exact = equipment.find(item =>
        getEquipmentSearchTerms(item).includes(normalizedQuery)
    );

    if (exact) {
        return exact;
    }

    return equipment.find(item =>
        getEquipmentSearchTerms(item).some(
            term => term.includes(normalizedQuery) || normalizedQuery.includes(term)
        )
    ) || null;
}
