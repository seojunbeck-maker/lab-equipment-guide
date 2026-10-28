import {
    createHmac,
    timingSafeEqual
} from "node:crypto";

const COOKIE_NAME = "lab_guide_admin";
const SESSION_SECONDS = 8 * 60 * 60;

function getRequiredSecret(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`${name} is not configured.`);
    }

    return value;
}

function safeEqual(left, right) {
    const leftBuffer = Buffer.from(String(left));
    const rightBuffer = Buffer.from(String(right));

    return leftBuffer.length === rightBuffer.length &&
        timingSafeEqual(leftBuffer, rightBuffer);
}

function signature(payload) {
    return createHmac(
        "sha256",
        getRequiredSecret("ADMIN_SESSION_SECRET")
    ).update(payload).digest("base64url");
}

function parseCookies(header) {
    return String(header || "")
        .split(";")
        .map(item => item.trim())
        .filter(Boolean)
        .reduce(
            function (cookies, item) {
                const separator = item.indexOf("=");

                if (separator > 0) {
                    cookies[item.slice(0, separator)] =
                        decodeURIComponent(item.slice(separator + 1));
                }

                return cookies;
            },
            {}
        );
}

export function verifyAdminPassword(value) {
    return safeEqual(
        typeof value === "string" ? value : "",
        getRequiredSecret("ADMIN_PASSWORD")
    );
}

export function createAdminSessionToken() {
    const payload = Buffer.from(
        JSON.stringify({
            exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS
        })
    ).toString("base64url");

    return `${payload}.${signature(payload)}`;
}

export function hasValidAdminSession(req) {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[COOKIE_NAME];

    if (!token) {
        return false;
    }

    const [payload, providedSignature, extra] = token.split(".");

    if (!payload || !providedSignature || extra) {
        return false;
    }

    if (!safeEqual(providedSignature, signature(payload))) {
        return false;
    }

    try {
        const session = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8")
        );

        return Number.isFinite(session.exp) &&
            session.exp > Math.floor(Date.now() / 1000);

    } catch {
        return false;
    }
}

export function adminSessionCookie(token) {
    return [
        `${COOKIE_NAME}=${encodeURIComponent(token)}`,
        "Path=/",
        `Max-Age=${SESSION_SECONDS}`,
        "HttpOnly",
        "Secure",
        "SameSite=Strict"
    ].join("; ");
}

export function clearAdminSessionCookie() {
    return [
        `${COOKIE_NAME}=`,
        "Path=/",
        "Max-Age=0",
        "HttpOnly",
        "Secure",
        "SameSite=Strict"
    ].join("; ");
}
