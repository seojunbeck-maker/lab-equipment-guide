import {
    adminSessionCookie,
    clearAdminSessionCookie,
    createAdminSessionToken,
    hasValidAdminSession,
    verifyAdminPassword
} from "../lib/admin-auth.js";
import { parseRequestBody } from "../lib/supabase-rest.js";

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    try {
        if (req.method === "GET") {
            return res.status(200).json({
                authenticated: hasValidAdminSession(req)
            });
        }

        if (req.method === "POST") {
            const body = parseRequestBody(req);
            const password = typeof body?.password === "string"
                ? body.password
                : "";

            if (!password || password.length > 200) {
                return res.status(400).json({
                    error: "관리자 비밀번호를 입력해 주세요."
                });
            }

            if (!verifyAdminPassword(password)) {
                return res.status(401).json({
                    error: "관리자 비밀번호가 올바르지 않습니다."
                });
            }

            res.setHeader(
                "Set-Cookie",
                adminSessionCookie(createAdminSessionToken())
            );

            return res.status(200).json({
                authenticated: true
            });
        }

        if (req.method === "DELETE") {
            res.setHeader(
                "Set-Cookie",
                clearAdminSessionCookie()
            );

            return res.status(200).json({
                authenticated: false
            });
        }

        res.setHeader("Allow", "GET, POST, DELETE");
        return res.status(405).json({
            error: "GET, POST 또는 DELETE 요청만 사용할 수 있습니다."
        });

    } catch (error) {
        console.error("Admin session API error:", error);
        return res.status(500).json({
            error: "관리자 인증 설정을 확인하지 못했습니다."
        });
    }
}
