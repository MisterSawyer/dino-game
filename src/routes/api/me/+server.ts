import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	return new Response(
		JSON.stringify({
			user: locals.user ?? null,
			csrfToken: locals.csrfToken
		}),
		{ headers: { 'content-type': 'application/json' } }
	);
};
