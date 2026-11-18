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
        return null;
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

    const email = typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password = typeof body.password === "string"
        ? body.password
        : "";

    if (
        !email ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return jsonResponse({
            error: "올바른 이메일 주소를 입력해 주세요."
        }, 400);
    }

    if (password.length < 6 || password.length > 72) {
        return jsonResponse({
            error: "비밀번호는 6자 이상 72자 이하로 입력해 주세요."
        }, 400);
    }

    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
            method: "POST",
            headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    created_via: "lab-equipment-guide"
                }
            })
        });
        const data = await readJson(response);

        if (!response.ok) {
            const errorCode = String(
                data?.code || data?.error_code || ""
            ).toLowerCase();
            const errorMessage = String(
                data?.msg || data?.message || data?.error || ""
            ).toLowerCase();

            if (
                response.status === 409 ||
                errorCode.includes("already") ||
                errorMessage.includes("already been registered") ||
                errorMessage.includes("already exists")
            ) {
                return jsonResponse({
                    error: "이미 가입된 이메일입니다. 로그인해 주세요."
                }, 409);
            }

            console.error(
                "Supabase Auth admin create failed:",
                response.status,
                errorCode || "unknown_error"
            );

            if (response.status === 429) {
                return jsonResponse({
                    error: "회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
                }, 429);
            }

            return jsonResponse({
                error: "회원가입 정보를 확인해 주세요."
            }, 400);
        }

        return jsonResponse({ created: true }, 201);

    } catch (error) {
        console.error("Create app user function error:", error);
        return jsonResponse({
            error: "회원가입 처리 중 오류가 발생했습니다."
        }, 500);
    }
});
