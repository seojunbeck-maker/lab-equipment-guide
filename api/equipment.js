export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "GET 요청만 사용할 수 있습니다."
        });
    }

    try {

        const name = req.query.name;

        if (!name) {
            return res.status(400).json({
                error: "기구 이름이 없습니다."
            });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({
                error: "데이터베이스 연결 설정이 없습니다."
            });
        }

        const url =
            `${supabaseUrl}/rest/v1/equipment` +
            `?name=eq.${encodeURIComponent(name)}` +
            `&select=*`;

        const response = await fetch(url, {
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${supabaseKey}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(data);

            return res.status(500).json({
                error: "기구 정보를 불러오지 못했습니다."
            });
        }

        if (!data || data.length === 0) {
            return res.status(404).json({
                error: "데이터베이스에 등록된 기구 정보가 없습니다."
            });
        }

        return res.status(200).json({
            equipment: data[0]
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "기구 정보를 불러오는 중 오류가 발생했습니다."
        });
    }
}