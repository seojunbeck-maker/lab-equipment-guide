import { getSupabaseConfig } from "../lib/supabase-rest.js";

export function isPublicSupabaseKey(value) {
    const key = String(value || "").trim();

    if (key.startsWith("sb_publishable_")) {
        return true;
    }

    const parts = key.split(".");

    if (parts.length !== 3) {
        return false;
    }

    try {
        const payload = JSON.parse(
            Buffer.from(parts[1], "base64url").toString("utf8")
        );
        return payload?.role === "anon";
    } catch {
        return false;
    }
}

export default function handler(req, res) {
    res.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");

    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({
            error: "GET 요청만 사용할 수 있습니다."
        });
    }

    try {
        const { url, key: fallbackKey } = getSupabaseConfig();
        const publishableKey =
            process.env.SUPABASE_PUBLISHABLE_KEY || fallbackKey;

        if (!isPublicSupabaseKey(publishableKey)) {
            console.error("Auth config refused a non-public Supabase key.");
            return res.status(500).json({
                error: "로그인 기능 설정을 확인하고 있습니다. 잠시 후 다시 시도해 주세요."
            });
        }

        return res.status(200).json({
            supabaseUrl: url,
            supabaseKey: publishableKey
        });
    } catch (error) {
        console.error("Auth config error:", error);
        return res.status(500).json({
            error: "로그인 기능 설정을 불러오지 못했습니다."
        });
    }
}
