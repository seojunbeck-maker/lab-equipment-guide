import { supabaseRequest } from "../lib/supabase-rest.js";
import {
    addEquipmentSearchMetadata,
    findEquipmentBySearch
} from "../lib/equipment-search.js";

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "GET 요청만 사용할 수 있습니다."
        });
    }

    try {
        const name = typeof req.query.name === "string"
            ? req.query.name.trim()
            : "";

        if (!name) {
            return res.status(400).json({
                error: "기구 이름이 없습니다."
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                error: "기구 이름은 100자 이하여야 합니다."
            });
        }

        const params = new URLSearchParams({
            select:
                "id,name,english_name,aliases,key_features,category,purpose,structure,usage,caution,image_url",
            order: "name.asc"
        });
        const { response, data } = await supabaseRequest(
            "equipment",
            { params }
        );

        if (!response.ok) {
            console.error(
                "Supabase equipment request failed:",
                response.status,
                data
            );
            return res.status(500).json({
                error: "데이터베이스에서 기구 정보를 불러오지 못했습니다."
            });
        }

        const equipment = (Array.isArray(data) ? data : [])
            .map(addEquipmentSearchMetadata);
        const match = findEquipmentBySearch(equipment, name);

        if (!match) {
            return res.status(404).json({
                error: `"${name}"에 대한 정보가 아직 데이터베이스에 등록되어 있지 않습니다.`
            });
        }

        return res.status(200).json({ equipment: match });
    } catch (error) {
        console.error("Equipment API error:", error);
        return res.status(500).json({
            error: "기구 정보를 불러오는 중 오류가 발생했습니다."
        });
    }
}
