export function getSupabaseConfig() {
    const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
    const key = process.env.SUPABASE_KEY;

    if (!url || !key) {
        throw new Error("Supabase environment variables are missing.");
    }

    return { url, key };
}

export function parseRequestBody(req) {
    if (typeof req.body === "string") {
        try {
            return JSON.parse(req.body);
        } catch {
            return null;
        }
    }

    return req.body ?? null;
}

export async function supabaseRequest(
    table,
    { method = "GET", params, body, prefer } = {}
) {
    const { url, key } = getSupabaseConfig();
    const query = params ? `?${params.toString()}` : "";

    const headers = {
        apikey: key,
        Accept: "application/json",
        "Content-Type": "application/json"
    };

    if (prefer) {
        headers.Prefer = prefer;
    }

    const response = await fetch(
        `${url}/rest/v1/${table}${query}`,
        {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body)
        }
    );

    const text = await response.text();
    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    return { response, data };
}
