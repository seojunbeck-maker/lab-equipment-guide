import {
    getSupabaseConfig,
    parseRequestBody
} from "../lib/supabase-rest.js";

const SIGNUP_WINDOW_MS = 60 * 1000;
const MAX_SIGNUP_ATTEMPTS = 5;
const signupAttempts = new Map();

function normalizedEmail(value) {
    return typeof value === "string"
        ? value.trim().toLowerCase()
        : "";
}

function getClientAddress(req) {
    const header =
        req.headers?.["x-vercel-forwarded-for"] ||
        req.headers?.["x-forwarded-for"] ||
        req.headers?.["x-real-ip"] ||
        req.socket?.remoteAddress ||
        "unknown";

    return String(header).split(",")[0].trim() || "unknown";
}

function isRateLimited(req) {
    const now = Date.now();
    const clientAddress = getClientAddress(req);
    const current = signupAttempts.get(clientAddress);

    if (!current || now - current.startedAt >= SIGNUP_WINDOW_MS) {
        signupAttempts.set(clientAddress, {
            count: 1,
            startedAt: now
        });
        return false;
    }

    current.count += 1;
    return current.count > MAX_SIGNUP_ATTEMPTS;
}

async function readJson(response) {
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

export default async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({
            error: "POST 요청만 사용할 수 있습니다."
        });
    }

    if (isRateLimited(req)) {
        return res.status(429).json({
            error: "회원가입 요청이 너무 많습니다. 1분 후 다시 시도해 주세요."
        });
    }

    const body = parseRequestBody(req);
    const email = normalizedEmail(body?.email);
    const password = typeof body?.password === "string"
        ? body.password
        : "";

    if (
        !email ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
        return res.status(400).json({
            error: "올바른 이메일 주소를 입력해 주세요."
        });
    }

    if (password.length < 6 || password.length > 72) {
        return res.status(400).json({
            error: "비밀번호는 6자 이상 72자 이하로 입력해 주세요."
        });
    }

    try {
        const { url, key } = getSupabaseConfig();
        const adminToken = process.env.ADMIN_EDGE_TOKEN;

        if (!adminToken) {
            throw new Error("ADMIN_EDGE_TOKEN is not configured.");
        }

        const response = await fetch(
            `${url}/functions/v1/create-app-user`,
            {
                method: "POST",
                headers: {
                    apikey: key,
                    "Content-Type": "application/json",
                    "x-admin-token": adminToken
                },
                body: JSON.stringify({ email, password })
            }
        );
        const data = await readJson(response);

        if (!response.ok) {
            const status = [400, 409, 429].includes(response.status)
                ? response.status
                : 500;

            return res.status(status).json({
                error: data?.error || "회원가입을 처리하지 못했습니다."
            });
        }

        return res.status(201).json({ created: true });

    } catch (error) {
        console.error("Signup API error:", error);
        return res.status(500).json({
            error: "회원가입 서버 연결 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
        });
    }
}
