import { supabaseRequest } from "../lib/supabase-rest.js";

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "GET 요청만 사용할 수 있습니다."
        });
    }

    try {
        const name =
            typeof req.query.name === "string"
                ? req.query.name.trim()
                : "";
        const category =
            typeof req.query.category === "string"
                ? req.query.category.trim()
                : "";

        if (name.length > 100 || category.length > 100) {
            return res.status(400).json({
                error: "검색어와 category는 100자 이하여야 합니다."
            });
        }

        const params = new URLSearchParams({
            select:
                "id,name,category,purpose,structure,usage,caution,image_url",
            order: "name.asc"
        });

        if (name) {
            params.set("name", `ilike.*${name.replace(/\*/g, "")}*`);
        }

        if (category) {
            params.set("category", `eq.${category}`);
        }

        const { response, data } = await supabaseRequest(
            "equipment",
            { params }
        );

        if (!response.ok) {
            console.error(
                "Equipment list read failed:",
                response.status,
                data
            );
            return res.status(500).json({
                error: "기구 목록을 불러오지 못했습니다."
            });
        }

        return res.status(200).json({
            equipment: Array.isArray(data) ? data : []
        });
    } catch (error) {
        console.error("Equipment list API error:", error);
        return res.status(500).json({
            error: "기구 목록 처리 중 오류가 발생했습니다."
        });
    }
}
