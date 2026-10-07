const aliases = {
    "유리 비커": "비커",
    "glass beaker": "비커",

    "삼각플라스크": "삼각 플라스크",
    "에를렌마이어 플라스크": "삼각 플라스크",

    "눈금 실린더": "메스실린더",
    "메스 실린더": "메스실린더",
    "graduated cylinder": "메스실린더",

    "광학현미경": "광학 현미경",

    "전자 저울": "전자저울"
};


export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            error: "GET 요청만 사용할 수 있습니다."
        });
    }


    try {

        let name = req.query.name;


        if (!name) {
            return res.status(400).json({
                error: "기구 이름이 없습니다."
            });
        }


        name = String(name).trim();


        /*
        Gemini가 약간 다른 이름으로 반환해도
        DB의 표준 이름으로 변경
        */
        if (aliases[name]) {
            name = aliases[name];
        }


        const supabaseUrl =
            process.env.SUPABASE_URL;

        const supabaseKey =
            process.env.SUPABASE_KEY;


        if (!supabaseUrl || !supabaseKey) {

            console.error(
                "Supabase environment variables are missing."
            );

            return res.status(500).json({
                error: "데이터베이스 연결 설정에 문제가 있습니다."
            });
        }


        const cleanUrl =
            supabaseUrl.replace(/\/$/, "");


        const url =
            `${cleanUrl}/rest/v1/equipment` +
            `?name=eq.${encodeURIComponent(name)}` +
            `&select=*`;


        /*
        중요:
        sb_publishable_ 키는 apikey 헤더로 사용
        Authorization Bearer에는 넣지 않음
        */
        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers: {
                        apikey: supabaseKey,

                        "Content-Type":
                            "application/json"
                    }
                }
            );


        const text =
            await response.text();


        let data;


        try {
            data = JSON.parse(text);
        }

        catch {
            data = text;
        }


        /*
        Supabase 자체 요청 실패
        */
        if (!response.ok) {

            console.error(
                "Supabase request failed:",
                response.status,
                data
            );


            return res.status(500).json({
                error:
                    "데이터베이스에서 기구 정보를 불러오지 못했습니다."
            });
        }


        /*
        검색 결과 없음
        */
        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            return res.status(404).json({
                error:
                    `"${name}"에 대한 정보가 아직 데이터베이스에 등록되어 있지 않습니다.`
            });
        }


        /*
        정상 반환
        */
        return res.status(200).json({
            equipment: data[0]
        });

    }

    catch (error) {

        console.error(
            "Equipment API error:",
            error
        );


        return res.status(500).json({
            error:
                "기구 정보를 불러오는 중 오류가 발생했습니다."
        });
    }
}