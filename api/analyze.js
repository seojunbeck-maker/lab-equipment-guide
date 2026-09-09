const MODEL = "gemini-3.7-flash";

const MAX_RETRIES = 3;


/*
========================================
잠시 기다리는 함수
========================================
*/

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


/*
========================================
Gemini API 호출
503 / 429 발생 시 자동 재시도
========================================
*/

async function callGemini(url, options) {

    let lastResponse = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {

        const response = await fetch(url, options);

        lastResponse = response;


        /*
        정상 응답이면 바로 반환
        */

        if (response.ok) {
            return response;
        }


        /*
        일시적인 과부하 또는 요청 제한
        */

        if (
            response.status === 503 ||
            response.status === 429
        ) {

            if (attempt < MAX_RETRIES - 1) {

                /*
                1차 실패 → 1.5초
                2차 실패 → 3초
                */

                const waitTime =
                    1500 * (attempt + 1);

                await sleep(waitTime);

                continue;
            }
        }


        /*
        재시도해도 의미 없는 오류
        */

        return response;
    }


    return lastResponse;
}


/*
========================================
Vercel Serverless Function
========================================
*/

export default async function handler(req, res) {

    /*
    POST 요청만 허용
    */

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "지원하지 않는 요청 방식입니다."
        });
    }


    try {

        /*
        이미지 데이터 받기
        */

        const {
            image,
            mimeType
        } = req.body || {};


        if (!image || !mimeType) {

            return res.status(400).json({
                error: "분석할 이미지가 없습니다."
            });
        }


        /*
        이미지 MIME 타입 검사
        */

        if (!mimeType.startsWith("image/")) {

            return res.status(400).json({
                error: "이미지 파일만 분석할 수 있습니다."
            });
        }


        /*
        Vercel 환경 변수에서 API Key 가져오기
        */

        const apiKey =
            process.env.GEMINI_API_KEY;


        if (!apiKey) {

            console.error(
                "GEMINI_API_KEY is not configured."
            );

            return res.status(500).json({
                error:
                    "이미지 분석 기능 설정에 문제가 있습니다."
            });
        }


        /*
        분석 프롬프트
        */

        const prompt = `
사진 속 물체를 분석하여 과학 실험 또는 실험실에서 사용하는 실험기구인지 판별하라.

가장 가능성이 높은 후보를 최대 3개 제시하라.

각 후보는 다음 정보를 포함해야 한다.

name:
일반적으로 사용하는 정확한 한국어 기구 이름

confidence:
사진을 기준으로 해당 기구라고 판단하는 추정 신뢰도
0부터 100까지의 정수

reason:
외형, 구조, 부품, 형태 등 사진에서 확인할 수 있는 특징을 근거로
해당 기구라고 판단한 이유를 한국어 한 문장으로 설명

후보는 가장 가능성이 높은 순서대로 정렬한다.

confidence는 실제 통계적 확률이 아니라
이미지를 바탕으로 한 모델의 상대적 추정 신뢰도이다.

사진만으로 정확한 기구를 특정하기 어렵다면
그 사실을 반영하여 신뢰도를 낮게 설정한다.

사진 속 물체가 실험기구가 아니라면
존재하지 않는 실험기구 이름을 만들어내지 말고
사진에서 실제로 보이는 물체를 후보로 제시한다.

반드시 아래 형태의 JSON만 출력한다.
JSON 바깥의 설명, 마크다운, 코드 블록은 출력하지 않는다.

{
    "candidates": [
        {
            "name": "광학 현미경",
            "confidence": 90,
            "reason": "접안렌즈와 대물렌즈 및 재물대 구조가 확인됩니다."
        }
    ]
}
`;


        /*
        Gemini 요청 데이터
        */

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

                temperature: 0.1,

                responseMimeType:
                    "application/json"
            }
        };


        /*
        API URL
        */

        const apiUrl =
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;


        /*
        Gemini 요청
        */

        const response =
            await callGemini(
                apiUrl,
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


        /*
        응답 JSON 읽기
        */

        let data;

        try {

            data =
                await response.json();

        }

        catch (error) {

            console.error(
                "Failed to parse API response",
                error
            );


            return res.status(500).json({
                error:
                    "분석 결과를 처리하지 못했습니다."
            });
        }


        /*
        API 오류 처리
        */

        if (!response.ok) {

            console.error(
                "Image analysis API error:",
                response.status,
                data
            );


            /*
            서버 과부하
            */

            if (response.status === 503) {

                return res.status(503).json({
                    error:
                        "현재 분석 요청이 많습니다. 잠시 후 다시 시도해 주세요."
                });
            }


            /*
            요청 제한
            */

            if (response.status === 429) {

                return res.status(429).json({
                    error:
                        "잠시 동안 분석 요청이 많았습니다. 잠시 후 다시 시도해 주세요."
                });
            }


            /*
            인증 문제
            */

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                return res.status(500).json({
                    error:
                        "이미지 분석 기능 설정에 문제가 있습니다."
                });
            }


            /*
            기타 오류
            */

            return res.status(500).json({
                error:
                    "이미지 분석 중 오류가 발생했습니다. 다시 시도해 주세요."
            });
        }


        /*
        Gemini가 반환한 텍스트 추출
        */

        const parts =
            data
                ?.candidates
                ?.[0]
                ?.content
                ?.parts;


        if (
            !Array.isArray(parts) ||
            parts.length === 0
        ) {

            console.error(
                "No response parts:",
                data
            );


            return res.status(500).json({
                error:
                    "이미지에서 분석 결과를 얻지 못했습니다."
            });
        }


        /*
        text가 있는 part를 합침
        */

        const text =
            parts
                .map((part) => part.text || "")
                .join("")
                .trim();


        if (!text) {

            console.error(
                "Empty analysis result:",
                data
            );


            return res.status(500).json({
                error:
                    "이미지에서 분석 결과를 얻지 못했습니다."
            });
        }


        /*
        JSON 파싱
        */

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
                    "분석 결과 형식을 처리하지 못했습니다. 다시 시도해 주세요."
            });
        }


        /*
        candidates 확인
        */

        if (
            !parsed ||
            !Array.isArray(
                parsed.candidates
            ) ||
            parsed.candidates.length === 0
        ) {

            console.error(
                "Invalid candidates:",
                parsed
            );


            return res.status(500).json({
                error:
                    "적절한 실험기구 후보를 찾지 못했습니다."
            });
        }


        /*
        후보 데이터 정리
        */

        const candidates =
            parsed.candidates

                .slice(0, 3)

                .map(
                    (candidate) => {

                        const name =
                            String(
                                candidate.name ||
                                "알 수 없는 기구"
                            ).trim();


                        let confidence =
                            Number(
                                candidate.confidence
                            );


                        if (
                            !Number.isFinite(
                                confidence
                            )
                        ) {

                            confidence = 0;
                        }


                        confidence =
                            Math.round(
                                Math.max(
                                    0,
                                    Math.min(
                                        100,
                                        confidence
                                    )
                                )
                            );


                        const reason =
                            String(
                                candidate.reason ||
                                "사진에서 확인되는 외형적 특징을 기준으로 판단했습니다."
                            ).trim();


                        return {

                            name,

                            confidence,

                            reason
                        };
                    }
                );


        /*
        최종 결과 반환
        */

        return res.status(200).json({

            candidates
        });

    }

    catch (error) {

        console.error(
            "Server error:",
            error
        );


        return res.status(500).json({

            error:
                "서버에서 이미지 분석 중 오류가 발생했습니다. 다시 시도해 주세요."
        });
    }
}