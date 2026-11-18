import assert from "node:assert/strict";
import test from "node:test";

import authConfigHandler, {
    isPublicSupabaseKey
} from "../api/auth-config.js";
import favoritesHandler from "../api/favorites.js";
import historyHandler from "../api/history.js";
import signupHandler from "../api/signup.js";
import { getBearerToken } from "../lib/user-auth.js";

function createResponse() {
    return {
        statusCode: 200,
        headers: {},
        body: null,
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(value) {
            this.statusCode = value;
            return this;
        },
        json(value) {
            this.body = value;
            return this;
        }
    };
}

test("auth config exposes only publishable or anon keys", () => {
    const payload = Buffer.from(
        JSON.stringify({ role: "anon" })
    ).toString("base64url");

    assert.equal(isPublicSupabaseKey("sb_publishable_example"), true);
    assert.equal(isPublicSupabaseKey(`header.${payload}.signature`), true);
    assert.equal(isPublicSupabaseKey("sb_secret_example"), false);
    assert.equal(isPublicSupabaseKey("service-role-secret"), false);
});

test("auth config refuses a secret key", () => {
    const previousUrl = process.env.SUPABASE_URL;
    const previousKey = process.env.SUPABASE_KEY;
    const previousPublishable = process.env.SUPABASE_PUBLISHABLE_KEY;

    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "sb_secret_do_not_expose";
    delete process.env.SUPABASE_PUBLISHABLE_KEY;

    const res = createResponse();
    authConfigHandler({ method: "GET" }, res);

    assert.equal(res.statusCode, 500);
    assert.equal("supabaseKey" in (res.body || {}), false);

    process.env.SUPABASE_URL = previousUrl;
    process.env.SUPABASE_KEY = previousKey;
    process.env.SUPABASE_PUBLISHABLE_KEY = previousPublishable;
});

test("bearer token parsing is strict", () => {
    assert.equal(
        getBearerToken({ headers: { authorization: "Bearer abc.def.ghi" } }),
        "abc.def.ghi"
    );
    assert.equal(
        getBearerToken({ headers: { authorization: "Basic abc" } }),
        ""
    );
});

test("personal APIs reject unauthenticated requests", async () => {
    const historyRes = createResponse();
    await historyHandler(
        { method: "GET", headers: {}, query: {} },
        historyRes
    );
    assert.equal(historyRes.statusCode, 401);
    assert.equal(historyRes.body.code, "AUTH_REQUIRED");

    const favoriteRes = createResponse();
    await favoritesHandler(
        { method: "GET", headers: {}, query: {} },
        favoriteRes
    );
    assert.equal(favoriteRes.statusCode, 401);
    assert.equal(favoriteRes.body.code, "AUTH_REQUIRED");
});

test("history API forwards the user token to RLS-protected reads", async () => {
    const previousUrl = process.env.SUPABASE_URL;
    const previousKey = process.env.SUPABASE_KEY;
    const previousFetch = globalThis.fetch;
    const requests = [];

    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "sb_publishable_example";

    globalThis.fetch = async (url, options = {}) => {
        requests.push({ url: String(url), options });

        if (String(url).endsWith("/auth/v1/user")) {
            return new Response(JSON.stringify({
                id: "11111111-1111-1111-1111-111111111111",
                email: "student@example.com"
            }), { status: 200 });
        }

        return new Response("[]", { status: 200 });
    };

    const res = createResponse();
    await historyHandler({
        method: "GET",
        headers: { authorization: "Bearer user-access-token" },
        query: { limit: "10" }
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(requests.length, 2);
    assert.equal(
        requests[1].options.headers.Authorization,
        "Bearer user-access-token"
    );
    assert.match(requests[1].url, /user_id=eq\.11111111/);

    globalThis.fetch = previousFetch;
    process.env.SUPABASE_URL = previousUrl;
    process.env.SUPABASE_KEY = previousKey;
});

test("signup API validates input before calling the privileged function", async () => {
    const previousFetch = globalThis.fetch;
    let called = false;

    globalThis.fetch = async () => {
        called = true;
        return new Response("{}", { status: 201 });
    };

    const res = createResponse();
    await signupHandler({
        method: "POST",
        headers: { "x-forwarded-for": "198.51.100.10" },
        body: {
            email: "not-an-email",
            password: "password"
        }
    }, res);

    assert.equal(res.statusCode, 400);
    assert.equal(called, false);
    globalThis.fetch = previousFetch;
});

test("signup API keeps the admin token server-side", async () => {
    const previousUrl = process.env.SUPABASE_URL;
    const previousKey = process.env.SUPABASE_KEY;
    const previousToken = process.env.ADMIN_EDGE_TOKEN;
    const previousFetch = globalThis.fetch;
    let capturedRequest;

    process.env.SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_KEY = "sb_publishable_example";
    process.env.ADMIN_EDGE_TOKEN = "server-only-token";

    globalThis.fetch = async (url, options = {}) => {
        capturedRequest = { url: String(url), options };
        return new Response(JSON.stringify({ created: true }), {
            status: 201
        });
    };

    const res = createResponse();
    await signupHandler({
        method: "POST",
        headers: { "x-forwarded-for": "198.51.100.11" },
        body: {
            email: "student@school.example",
            password: "strong-password"
        }
    }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.created, true);
    assert.equal(
        capturedRequest.url,
        "https://example.supabase.co/functions/v1/create-app-user"
    );
    assert.equal(
        capturedRequest.options.headers["x-admin-token"],
        "server-only-token"
    );
    assert.equal(JSON.stringify(res.body).includes("server-only-token"), false);

    globalThis.fetch = previousFetch;
    process.env.SUPABASE_URL = previousUrl;
    process.env.SUPABASE_KEY = previousKey;
    process.env.ADMIN_EDGE_TOKEN = previousToken;
});
