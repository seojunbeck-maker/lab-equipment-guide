import {
    parseRequestBody,
    supabaseRequest
} from "../lib/supabase-rest.js";

const FIELD_LIMITS = {
    name: 100,
    category: 100,
    purpose: 1500,
    structure: 1500,
    usage: 2500,
    caution: 1500
};

function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function validHttpsUrl(value) {
    if (!value) {
        return true;
    }

    try {
        const url = new URL(value);
        return url.protocol === "https:" && value.length <= 1000;
    } catch {
        return false;
    }
}

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "POST 요청만 사용할 수 있습니다."
        });
    }

    try {
        const body = parseRequestBody(req);

        if (!body || typeof body !== "object") {
            return res.status(400).json({
                error: "제안 내용을 확인해 주세요."
            });
        }

        if (cleanText(body.website)) {
            return res.status(201).json({
                accepted: true,
                status: "pending"
            });
        }

        const submission = Object.fromEntries(
            Object.keys(FIELD_LIMITS).map(
                key => [key, cleanText(body[key])]
            )
        );
        const imageUrl = cleanText(body.image_url);

        for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
            if (!submission[field] || submission[field].length > limit) {
                return res.status(400).json({
                    error: `${field} 내용을 ${limit}자 이하로 입력해 주세요.`
                });
            }
        }

        if (!validHttpsUrl(imageUrl)) {
            return res.status(400).json({
                error: "사진 주소는 https://로 시작하는 올바른 주소여야 합니다."
            });
        }

        const existingParams = new URLSearchParams({
            select: "id",
            name: `ilike.${submission.name}`,
            limit: "1"
        });
        const existing = await supabaseRequest(
            "equipment",
            { params: existingParams }
        );

        if (!existing.response.ok) {
            console.error(
                "Equipment duplicate check failed:",
                existing.response.status,
                existing.data
            );
            return res.status(500).json({
                error: "기존 사전 정보를 확인하지 못했습니다."
            });
        }

        if (Array.isArray(existing.data) && existing.data.length > 0) {
            return res.status(409).json({
                error: "같은 이름의 기구가 이미 사전에 등록되어 있습니다."
            });
        }

        const { response, data } = await supabaseRequest(
            "equipment_submissions",
            {
                method: "POST",
                body: {
                    ...submission,
                    image_url: imageUrl || null
                },
                prefer: "return=minimal"
            }
        );

        if (response.status === 409) {
            return res.status(409).json({
                error: "같은 이름의 제안이 이미 검토를 기다리고 있습니다."
            });
        }

        if (!response.ok) {
            console.error(
                "Equipment submission failed:",
                response.status,
                data
            );
            return res.status(500).json({
                error: "기구 제안을 저장하지 못했습니다."
            });
        }

        return res.status(201).json({
            accepted: true,
            status: "pending"
        });

    } catch (error) {
        console.error("Equipment submission API error:", error);
        return res.status(500).json({
            error: "기구 제안 처리 중 오류가 발생했습니다."
        });
    }
}
