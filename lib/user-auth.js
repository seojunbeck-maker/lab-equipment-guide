import { getSupabaseConfig } from "./supabase-rest.js";

export function getBearerToken(req) {
    const header = String(req?.headers?.authorization || "").trim();
    const match = header.match(/^Bearer\s+(.+)$/i);

    return match?.[1]?.trim() || "";
}

export async function getAuthenticatedUser(req) {
    const accessToken = getBearerToken(req);

    if (!accessToken) {
        return { accessToken: "", user: null };
    }

    const { url, key } = getSupabaseConfig();
    const response = await fetch(`${url}/auth/v1/user`, {
        headers: {
            apikey: key,
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        return { accessToken: "", user: null };
    }

    const user = await response.json();

    if (!user?.id) {
        return { accessToken: "", user: null };
    }

    return { accessToken, user };
}

export function authRequiredResponse(res) {
    return res.status(401).json({
        code: "AUTH_REQUIRED",
        error: "로그인이 필요합니다."
    });
}
