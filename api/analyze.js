const MODEL = "gemini-3.5-flash-lite";

const MAX_RETRIES = 2;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

function hasValidImageSignature(bytes, mimeType) {
    if (mimeType === "image/jpeg") {
        return bytes[0] === 0xff && bytes[1] === 0xd8;
    }

    if (mimeType === "image/png") {
        return bytes.subarray(0, 8).equals(
            Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
        );
    }

    if (mimeType === "image/gif") {
        const signature = bytes.subarray(0, 6).toString("ascii");
        return signature === "GIF87a" || signature === "GIF89a";
    }

    if (mimeType === "image/webp") {
        return bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
            bytes.subarray(8, 12).toString("ascii") === "WEBP";
    }

    return false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function callModel(url, options) {

    let lastResponse;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {

        const response = await fetch(url, options);

        lastResponse = response;

        if (response.ok) {
            return response;
        }

        if (
            response.status !== 429 &&
            response.status !== 503 &&
            response.status !== 500
        ) {
            return response;
        }

        if (attempt < MAX_RETRIES - 1) {

            const delay =
                500 +
                Math.floor(Math.random() * 300);

            await sleep(delay);
        }
    }

    return lastResponse;
}


export default async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            error: "지원하지 않는 요청입니다."
        });
    }

    try {

        const {
            image,
            mimeType
        } = req.body || {};

        if (!image || !mimeType) {

            return res.status(400).json({
                error: "분석할 이미지가 없습니다."
            });
        }

        if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {

            return res.status(400).json({
                error: "이미지 파일만 업로드할 수 있습니다."
            });
        }

        let imageBytes;

        try {
            imageBytes = Buffer.from(image, "base64");
        } catch {
            imageBytes = Buffer.alloc(0);
        }

        if (
            imageBytes.length === 0 ||
            imageBytes.length > MAX_IMAGE_BYTES ||
            !hasValidImageSignature(imageBytes, mimeType)
        ) {
            return res.status(400).json({
                error: imageBytes.length > MAX_IMAGE_BYTES
                    ? "이미지 크기는 10MB 이하여야 합니다."
                    : "이미지 파일만 업로드할 수 있습니다."
            });
        }


        const apiKey =
            process.env.GEMINI_API_KEY;

        if (!apiKey) {

            return res.status(500).json({
                error: "분석 기능 설정에 문제가 있습니다."
            });
        }


        const prompt = `
사진 속 물체가 어떤 과학 실험기구인지 빠르게 분류하라.

사진에 과학 실험기구가 없거나 기구 전체를 확인하기 어려우면 candidates를 빈 배열로 반환한다.

가장 가능성이 높은 실험기구 후보를 최대 3개 제시한다.

각 후보에는 다음 두 값만 포함한다.

name:
일반적으로 사용하는 한국어 실험기구 이름

confidence:
0부터 100까지의 정수 형태의 추정 신뢰도

가능성이 높은 순서대로 정렬한다.

불필요한 설명이나 판단 근거는 생성하지 않는다.

반드시 다음 JSON 형식만 출력한다.

{
  "candidates": [
    {
      "name": "비커",
      "confidence": 95
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
                                mimeType: mimeType,
                                data: image
                            }
                        }
                    ]
                }
            ],

            generationConfig: {

                temperature: 0,

                maxOutputTokens: 180,

                responseMimeType:
                    "application/json"
            }
        };


        const apiUrl =
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;


        const response =
            await callModel(
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


        const data =
            await response.json();


        if (!response.ok) {

            console.error(
                "Analysis API:",
                response.status,
                data
            );

            if (
                response.status === 429 ||
                response.status === 503
            ) {

                return res.status(503).json({
                    error:
                        "현재 분석 서버가 혼잡합니다. 잠시 후 다시 시도해 주세요."
                });
            }

            return res.status(500).json({
                error:
                    "이미지 분석에 실패했습니다."
            });
        }


        const text =
            data
                ?.candidates
                ?.[0]
                ?.content
                ?.parts
                ?.map(part => part.text || "")
                ?.join("")
                ?.trim();


        if (!text) {

            return res.status(500).json({
                error:
                    "분석 결과를 받지 못했습니다."
            });
        }


        let parsed;

        try {

            parsed =
                JSON.parse(text);

        } catch {

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
                    "올바른 분석 결과를 받지 못했습니다."
            });
        }

        const rankedCandidates = parsed.candidates
            .map(candidate => ({
                name: String(candidate.name || "").trim(),
                confidence: Math.round(
                    Math.max(0, Math.min(100, Number(candidate.confidence) || 0))
                )
            }))
            .filter(candidate => candidate.name)
            .sort((a, b) => b.confidence - a.confidence);

        if (
            rankedCandidates.length === 0 ||
            rankedCandidates[0].confidence < 35
        ) {
            return res.status(422).json({
                code: "NO_EQUIPMENT_DETECTED",
                error:
                    "실험기구를 정확하게 식별하지 못했습니다. 기구 전체가 잘 보이는 사진으로 다시 시도해 주세요."
            });
        }


        const candidates =
            rankedCandidates

                .map(candidate => ({
                    name:
                        String(
                            candidate.name || ""
                        ).trim(),

                    confidence:
                        Math.round(
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    Number(
                                        candidate.confidence
                                    ) || 0
                                )
                            )
                        )
                }))

                .filter(candidate =>
                    candidate.name &&
                    candidate.confidence >= 50
                )

                .slice(0, 3);


        /*
        50% 이상 후보가 하나도 없으면
        가장 높은 후보 하나는 보여준다.
        */

        if (candidates.length === 0) {

            const fallback = rankedCandidates[0];


            if (fallback?.name) {

                return res.status(200).json({
                    candidates: [
                        fallback
                    ],
                    lowConfidence: true
                });
            }


            return res.status(200).json({
                candidates: [],
                lowConfidence: true
            });
        }


        return res.status(200).json({
            candidates,
            lowConfidence: false
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error:
                "이미지 분석 중 오류가 발생했습니다."
        });
    }
}
