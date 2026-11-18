import assert from "node:assert/strict";
import test from "node:test";

import analyzeHandler from "../api/analyze.js";

function createResponse() {
    return {
        statusCode: 200,
        body: null,
        status(value) {
            this.statusCode = value;
            return this;
        },
        json(value) {
            this.body = value;
            return this;
        }
    };
}

test("analyze rejects non-image content with a clear message", async () => {
    const res = createResponse();

    await analyzeHandler({
        method: "POST",
        body: {
            image: Buffer.from("plain text").toString("base64"),
            mimeType: "text/plain"
        }
    }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "이미지 파일만 업로드할 수 있습니다.");
});

test("analyze rejects a spoofed image MIME type", async () => {
    const res = createResponse();

    await analyzeHandler({
        method: "POST",
        body: {
            image: Buffer.from("not really a jpeg").toString("base64"),
            mimeType: "image/jpeg"
        }
    }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "이미지 파일만 업로드할 수 있습니다.");
});

test("analyze explains when no equipment is detected", async () => {
    const previousKey = process.env.GEMINI_API_KEY;
    const previousFetch = globalThis.fetch;
    const pngHeader = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
    ]);

    process.env.GEMINI_API_KEY = "test-key";
    globalThis.fetch = async () => new Response(JSON.stringify({
        candidates: [{
            content: {
                parts: [{ text: JSON.stringify({ candidates: [] }) }]
            }
        }]
    }), { status: 200 });

    const res = createResponse();
    await analyzeHandler({
        method: "POST",
        body: {
            image: pngHeader.toString("base64"),
            mimeType: "image/png"
        }
    }, res);

    assert.equal(res.statusCode, 422);
    assert.equal(res.body.code, "NO_EQUIPMENT_DETECTED");
    assert.equal(
        res.body.error,
        "실험기구를 정확하게 식별하지 못했습니다. 기구 전체가 잘 보이는 사진으로 다시 시도해 주세요."
    );

    globalThis.fetch = previousFetch;
    process.env.GEMINI_API_KEY = previousKey;
});
