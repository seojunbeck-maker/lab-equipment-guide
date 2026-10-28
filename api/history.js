import {
    parseRequestBody,
    supabaseRequest
} from "../lib/supabase-rest.js";

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    try {
        if (req.method === "GET") {
            const requestedLimit = Number(req.query.limit ?? 50);
            const limit = Number.isInteger(requestedLimit)
                ? Math.min(Math.max(requestedLimit, 1), 100)
                : 50;

            const params = new URLSearchParams({
                select: "id,equipment_name,confidence,created_at",
                order: "created_at.desc",
                limit: String(limit)
            });

            const { response, data } = await supabaseRequest(
                "analysis_history",
                { params }
            );

            if (!response.ok) {
                console.error("History read failed:", response.status, data);
                return res.status(500).json({
                    error: "분석 기록을 불러오지 못했습니다."
                });
            }

            return res.status(200).json({
                history: Array.isArray(data) ? data : []
            });
        }

        if (req.method === "POST") {
            const body = parseRequestBody(req);
            const equipmentName =
                typeof body?.equipment_name === "string"
                    ? body.equipment_name.trim()
                    : "";
            const confidence = Number(body?.confidence);

            if (
                !equipmentName ||
                equipmentName.length > 100 ||
                !Number.isFinite(confidence) ||
                confidence < 0 ||
                confidence > 1
            ) {
                return res.status(400).json({
                    error:
                        "equipment_name과 0부터 1 사이의 confidence가 필요합니다."
                });
            }

            const { response, data } = await supabaseRequest(
                "analysis_history",
                {
                    method: "POST",
                    body: {
                        equipment_name: equipmentName,
                        confidence
                    },
                    prefer: "return=representation"
                }
            );

            if (!response.ok) {
                console.error("History insert failed:", response.status, data);
                return res.status(500).json({
                    error: "분석 기록을 저장하지 못했습니다."
                });
            }

            return res.status(201).json({
                history: Array.isArray(data) ? data[0] : data
            });
        }

        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({
            error: "GET 또는 POST 요청만 사용할 수 있습니다."
        });
    } catch (error) {
        console.error("History API error:", error);
        return res.status(500).json({
            error: "분석 기록 처리 중 오류가 발생했습니다."
        });
    }
}
