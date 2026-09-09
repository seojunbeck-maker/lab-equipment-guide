export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "POST 요청만 사용할 수 있습니다."
        });
    }


    try {

        const {
            image,
            mimeType
        } = req.body;


        if (!image || !mimeType) {

            return res.status(400).json({
                error: "이미지 데이터가 없습니다."
            });
        }


        const apiKey =
            process.env.GEMINI_API_KEY;


        if (!apiKey) {

            return res.status(500).json({
                error:
                    "Gemini API 키가 설정되지 않았습니다."
            });
        }


        const prompt = `
사진 속 물체를 분석하여 실험실 또는 과학 실험에 사용되는 실험기구인지 판별하라.

사진에서 가장 가능성이 높은 실험기구 후보를 최대 3개 제시하라.

각 후보에 대해 다음 정보를 제공하라.

1. name: 일반적으로 사용되는 정확한 한국어 실험기구 이름
2. confidence: 해당 후보라고 판단하는 예상 신뢰도를 0~100 사이의 정수로 표시
3. reason: 사진의 형태, 구조, 부품 등 어떤 시각적 특징 때문에 해당 기구라고 판단했는지 한 문장으로 설명

후보는 가능성이 높은 순서대로 정렬한다.

confidence 값의 합은 반드시 100일 필요는 없다.
이 값은 실제 통계적 확률이 아니라 이미지 분석에 따른 모델의 추정 신뢰도임을 전제로 한다.

사진이 실험기구가 아닌 경우에도 억지로 실험기구 이름을 만들지 말고 가장 적절한 물체명을 제시하라.

반드시 다른 설명 없이 아래 JSON 형식으로만 응답하라.

{
  "candidates": [
    {
      "name": "기구 이름",
      "confidence": 90,
      "reason": "판단 근거"
    }
  ]
}
`;


        const requestBody = {

            contents: [
                {
                    role: "user",

                    parts: [

                        {
                            text: prompt
                        },

                        {
                            inlineData: {
                                mimeType:
                                    mimeType,

                                data:
                                    image
                            }
                        }

                    ]
                }
            ],

            generationConfig: {

                temperature: 0.2,

                responseMimeType:
                    "application/json"
            }
        };


        const response =
            await fetch(

                "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent",

                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "x-goog-api-key":
                            apiKey
                    },

                    body:
                        JSON.stringify(
                            requestBody
                        )
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Gemini API Error:",
                data
            );


            return res.status(500).json({

                error:
                    data.error?.message ||
                    "Gemini API 호출에 실패했습니다."
            });
        }


        const text =
            data
                .candidates?.[0]
                ?.content
                ?.parts?.[0]
                ?.text;


        if (!text) {

            return res.status(500).json({
                error:
                    "Gemini가 분석 결과를 반환하지 않았습니다."
            });
        }


        let parsed;


        try {

            parsed =
                JSON.parse(text);

        }

        catch (error) {

            console.error(
                "JSON parse error:",
                text
            );


            return res.status(500).json({
                error:
                    "분석 결과를 처리하지 못했습니다."
            });
        }


        if (
            !Array.isArray(
                parsed.candidates
            )
        ) {

            return res.status(500).json({
                error:
                    "올바른 후보 결과를 받지 못했습니다."
            });
        }


        const candidates =
            parsed.candidates
                .slice(0, 3)
                .map(
                    candidate => ({

                        name:
                            String(
                                candidate.name
                            ),

                        confidence:
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    Number(
                                        candidate.confidence
                                    ) || 0
                                )
                            ),

                        reason:
                            String(
                                candidate.reason || ""
                            )
                    })
                );


        return res.status(200).json({
            candidates
        });

    }

    catch (error) {

        console.error(error);


        return res.status(500).json({

            error:
                "서버에서 이미지 분석 중 오류가 발생했습니다."
        });
    }
}