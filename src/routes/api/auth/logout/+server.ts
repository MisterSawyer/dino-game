import type { RequestHandler } from '@sveltejs/kit';
import { deleteSession } from '$lib/server/auth.js';
import { SESSION_COOKIE, cookieSettings } from '$lib/server/security.js';
import { toSessionId } from '$lib/server/types.js';

export const POST: RequestHandler = async ({ cookies }) => {
        const existing = cookies.get(SESSION_COOKIE);
        if (existing) {
                deleteSession(toSessionId(existing));
        }

        cookies.delete(SESSION_COOKIE, cookieSettings);
        return new Response(JSON.stringify({ ok: true }), {
                headers: { 'content-type': 'application/json' }
        });
};
