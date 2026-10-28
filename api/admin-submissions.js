import { hasValidAdminSession } from "../lib/admin-auth.js";
import {
    getSupabaseConfig,
    parseRequestBody
} from "../lib/supabase-rest.js";

async function callAdminFunction(payload) {
    const { url, key } = getSupabaseConfig();
    const adminToken = process.env.ADMIN_EDGE_TOKEN;

    if (!adminToken) {
        throw new Error("ADMIN_EDGE_TOKEN is not configured.");
    }

    const response = await fetch(
        `${url}/functions/v1/admin-equipment-submissions`,
        {
            method: "POST",
            headers: {
                apikey: key,
                "Content-Type": "application/json",
                "x-admin-token": adminToken
            },
            body: JSON.stringify(payload)
        }
    );

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    return { response, data };
}

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    try {
        if (!hasValidAdminSession(req)) {
            return res.status(401).json({
                error: "관리자 로그인이 필요합니다."
            });
        }

        let payload;

        if (req.method === "GET") {
            payload = { action: "list" };

        } else if (req.method === "PATCH") {
            const body = parseRequestBody(req);
            const id = Number(body?.id);
            const action = body?.action;
            const reviewerNote = typeof body?.reviewer_note === "string"
                ? body.reviewer_note.trim()
                : "";
            const imageUrl = typeof body?.image_url === "string"
                ? body.image_url.trim()
                : "";

            if (
                !Number.isInteger(id) ||
                id <= 0 ||
                !["approve", "reject"].includes(action) ||
                reviewerNote.length > 1000 ||
                imageUrl.length > 1000
            ) {
                return res.status(400).json({
                    error: "검토 요청 내용을 확인해 주세요."
                });
            }

            if (imageUrl && !imageUrl.startsWith("https://")) {
                return res.status(400).json({
                    error: "사진 주소는 https://로 시작해야 합니다."
                });
            }

            payload = {
                action: "review",
                id,
                decision: action,
                reviewer_note: reviewerNote || null,
                image_url: imageUrl || null
            };

        } else {
            res.setHeader("Allow", "GET, PATCH");
            return res.status(405).json({
                error: "GET 또는 PATCH 요청만 사용할 수 있습니다."
            });
        }

        const { response, data } = await callAdminFunction(payload);

        if (!response.ok) {
            console.error(
                "Admin Edge Function failed:",
                response.status,
                data
            );

            const status = [400, 401, 404, 409].includes(response.status)
                ? response.status
                : 500;

            return res.status(status).json({
                error: data?.error || "관리자 검토 요청을 처리하지 못했습니다."
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error("Admin submissions API error:", error);
        return res.status(500).json({
            error: "관리자 검토 처리 중 오류가 발생했습니다."
        });
    }
}
