import {
    parseRequestBody,
    supabaseRequest
} from "../lib/supabase-rest.js";

function normalizedEquipmentName(value) {
    return typeof value === "string" ? value.trim() : "";
}

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    try {
        if (req.method === "GET") {
            const params = new URLSearchParams({
                select: "id,equipment_name,created_at",
                order: "created_at.desc"
            });

            const { response, data } = await supabaseRequest(
                "favorites",
                { params }
            );

            if (!response.ok) {
                console.error("Favorites read failed:", response.status, data);
                return res.status(500).json({
                    error: "즐겨찾기를 불러오지 못했습니다."
                });
            }

            return res.status(200).json({
                favorites: Array.isArray(data) ? data : []
            });
        }

        if (req.method === "POST") {
            const body = parseRequestBody(req);
            const equipmentName = normalizedEquipmentName(
                body?.equipment_name
            );

            if (!equipmentName || equipmentName.length > 100) {
                return res.status(400).json({
                    error: "equipment_name이 필요합니다."
                });
            }

            const { response, data } = await supabaseRequest(
                "favorites",
                {
                    method: "POST",
                    body: { equipment_name: equipmentName },
                    prefer: "return=representation"
                }
            );

            if (response.status === 409) {
                return res.status(409).json({
                    error: "이미 즐겨찾기에 등록된 기구입니다."
                });
            }

            if (!response.ok) {
                console.error("Favorite insert failed:", response.status, data);
                return res.status(500).json({
                    error: "즐겨찾기를 저장하지 못했습니다."
                });
            }

            return res.status(201).json({
                favorite: Array.isArray(data) ? data[0] : data
            });
        }

        if (req.method === "DELETE") {
            const params = new URLSearchParams();
            const id = Number(req.query.id);
            const equipmentName = normalizedEquipmentName(
                req.query.equipment_name
            );

            if (Number.isInteger(id) && id > 0) {
                params.set("id", `eq.${id}`);
            } else if (equipmentName && equipmentName.length <= 100) {
                params.set("equipment_name", `eq.${equipmentName}`);
            } else {
                return res.status(400).json({
                    error:
                        "삭제할 id 또는 equipment_name이 필요합니다."
                });
            }

            const { response, data } = await supabaseRequest(
                "favorites",
                {
                    method: "DELETE",
                    params,
                    prefer: "return=representation"
                }
            );

            if (!response.ok) {
                console.error("Favorite delete failed:", response.status, data);
                return res.status(500).json({
                    error: "즐겨찾기를 삭제하지 못했습니다."
                });
            }

            if (!Array.isArray(data) || data.length === 0) {
                return res.status(404).json({
                    error: "삭제할 즐겨찾기를 찾지 못했습니다."
                });
            }

            return res.status(200).json({
                deleted: data[0]
            });
        }

        res.setHeader("Allow", "GET, POST, DELETE");
        return res.status(405).json({
            error: "GET, POST 또는 DELETE 요청만 사용할 수 있습니다."
        });
    } catch (error) {
        console.error("Favorites API error:", error);
        return res.status(500).json({
            error: "즐겨찾기 처리 중 오류가 발생했습니다."
        });
    }
}
