import type { RequestHandler } from '@sveltejs/kit';
import { CSRF_COOKIE, ensureCsrfCookie, nonHttpOnlyCookieSettings } from '$lib/server/security.js';

export const GET: RequestHandler = async ({ cookies }) => {
	const token = ensureCsrfCookie({ cookies });
	cookies.set(CSRF_COOKIE, token, nonHttpOnlyCookieSettings);
	return new Response(JSON.stringify({ token }), {
		headers: { 'content-type': 'application/json' }
	});
};
