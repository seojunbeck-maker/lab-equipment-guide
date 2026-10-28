const EXPECTED_ADMIN_TOKEN_SHA256 =
    "bd4030a8723c8238afc4632c792effa7a1ecb8b2a1f188dd72c2038fbb35d713";

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

function bytesToHex(bytes: Uint8Array) {
    return Array.from(bytes)
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

function constantTimeEqual(left: string, right: string) {
    if (left.length !== right.length) {
        return false;
    }

    let difference = 0;

    for (let index = 0; index < left.length; index += 1) {
        difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
    }

    return difference === 0;
}

async function validAdminToken(request: Request) {
    const token = request.headers.get("x-admin-token") || "";
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(token)
    );

    return constantTimeEqual(
        bytesToHex(new Uint8Array(digest)),
        EXPECTED_ADMIN_TOKEN_SHA256
    );
}

async function readJson(response: Response) {
    const text = await response.text();

    if (!text) {
        return null;
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

Deno.serve(async request => {
    if (request.method !== "POST") {
        return jsonResponse({ error: "POST request required." }, 405);
    }

    if (!(await validAdminToken(request))) {
        return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\/$/, "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
        console.error("Supabase Edge Function environment is missing.");
        return jsonResponse({ error: "Server configuration error." }, 500);
    }

    let body: Record<string, unknown>;

    try {
        body = await request.json();
    } catch {
        return jsonResponse({ error: "Invalid JSON body." }, 400);
    }

    const headers = {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json"
    };

    try {
        if (body.action === "list") {
            const params = new URLSearchParams({
                select:
                    "id,name,category,purpose,structure,usage,caution,image_url,status,created_at",
                status: "eq.pending",
                order: "created_at.asc"
            });
            const response = await fetch(
                `${supabaseUrl}/rest/v1/equipment_submissions?${params}`,
                { headers }
            );
            const data = await readJson(response);

            if (!response.ok) {
                console.error("Submission list failed:", response.status, data);
                return jsonResponse({ error: "제안 목록을 불러오지 못했습니다." }, 500);
            }

            return jsonResponse({
                submissions: Array.isArray(data) ? data : []
            });
        }

        if (body.action === "review") {
            const id = Number(body.id);
            const decision = body.decision;

            if (
                !Number.isInteger(id) ||
                id <= 0 ||
                !["approve", "reject"].includes(String(decision))
            ) {
                return jsonResponse({ error: "Invalid review request." }, 400);
            }

            const response = await fetch(
                `${supabaseUrl}/rest/v1/rpc/review_equipment_submission`,
                {
                    method: "POST",
                    headers,
                    body: JSON.stringify({
                        p_id: id,
                        p_action: decision,
                        p_reviewer_note:
                            typeof body.reviewer_note === "string"
                                ? body.reviewer_note
                                : null,
                        p_image_url:
                            typeof body.image_url === "string"
                                ? body.image_url
                                : null
                    })
                }
            );
            const data = await readJson(response);

            if (!response.ok) {
                console.error("Submission review failed:", response.status, data);

                const message = data?.message || data?.error || "검토 요청을 처리하지 못했습니다.";
                const status = response.status === 404
                    ? 404
                    : response.status === 409
                        ? 409
                        : 400;

                return jsonResponse({ error: message }, status);
            }

            return jsonResponse({ review: data });
        }

        return jsonResponse({ error: "Unknown action." }, 400);

    } catch (error) {
        console.error("Admin equipment function error:", error);
        return jsonResponse({ error: "관리자 처리 중 오류가 발생했습니다." }, 500);
    }
});
