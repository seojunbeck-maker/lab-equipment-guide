import assert from "node:assert/strict";
import test from "node:test";

import equipmentHandler from "../api/equipment.js";
import equipmentListHandler from "../api/equipment-list.js";
import {
    equipmentMatchesSearch,
    getEquipmentGroupCategory,
    normalizeEquipmentSearch
} from "../lib/equipment-search.js";

const sampleEquipment = [
    {
        id: 9,
        name: "메스실린더",
        english_name: "Graduated cylinder",
        aliases: ["measuring cylinder", "메스 실린더"],
        key_features: "가늘고 긴 원통형 몸체와 촘촘한 눈금이 있다.",
        category: "부피 측정 기구",
        purpose: "부피 측정",
        structure: "가늘고 긴 원통형이다.",
        usage: "1. 세운다.",
        caution: "• 수평으로 읽는다.",
        image_url: "https://example.com/cylinder.jpg"
    },
    {
        id: 3,
        name: "비커",
        english_name: "Beaker",
        aliases: ["glass beaker"],
        key_features: "원통형 몸체와 넓은 입구가 있다.",
        category: "유리 기구",
        purpose: "액체 취급",
        structure: "원통형이다.",
        usage: "1. 액체를 넣는다.",
        caution: "• 정밀 측정에 쓰지 않는다.",
        image_url: "https://example.com/beaker.jpg"
    }
];

function createResponse() {
    return {
        statusCode: 200,
        headers: {},
        body: null,
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

test("search normalization ignores spaces and case", () => {
    assert.equal(
        normalizeEquipmentSearch("Graduated Cylinder"),
        normalizeEquipmentSearch("graduatedcylinder")
    );
    assert.equal(
        normalizeEquipmentSearch("메스 실린더"),
        normalizeEquipmentSearch("메스실린더")
    );
    assert.equal(
        equipmentMatchesSearch(sampleEquipment[0], "MEASURING CYLINDER"),
        true
    );
});

test("detailed categories map to stable large categories", () => {
    assert.equal(getEquipmentGroupCategory("부피 측정 기구"), "측정기구");
    assert.equal(getEquipmentGroupCategory("배양·접종 장비"), "배양기구");
    assert.equal(getEquipmentGroupCategory("감압 여과 기구"), "분리기구");
});

test("equipment list API filters normalized Korean and English names", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "test-key";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(
        JSON.stringify(sampleEquipment),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );

    try {
        const spaced = createResponse();
        await equipmentListHandler(
            { method: "GET", query: { name: "메스 실린더" } },
            spaced
        );
        assert.equal(spaced.statusCode, 200);
        assert.deepEqual(
            spaced.body.equipment.map(item => item.name),
            ["메스실린더"]
        );

        const english = createResponse();
        await equipmentListHandler(
            { method: "GET", query: { name: "GRADUATED CYLINDER" } },
            english
        );
        assert.deepEqual(
            english.body.equipment.map(item => item.name),
            ["메스실린더"]
        );

        const category = createResponse();
        await equipmentListHandler(
            { method: "GET", query: { category: "유리기구" } },
            category
        );
        assert.deepEqual(
            category.body.equipment.map(item => item.name),
            ["비커"]
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
});

test("equipment detail API resolves aliases and returns feature metadata", async () => {
    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "test-key";
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => new Response(
        JSON.stringify(sampleEquipment),
        { status: 200, headers: { "Content-Type": "application/json" } }
    );

    try {
        const response = createResponse();
        await equipmentHandler(
            { method: "GET", query: { name: "measuring cylinder" } },
            response
        );

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.equipment.name, "메스실린더");
        assert.match(response.body.equipment.key_features, /원통형/);
    } finally {
        globalThis.fetch = originalFetch;
    }
});
