import type { RequestHandler } from '@sveltejs/kit';
import { loadSave } from '$lib/server/save.js';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const result = loadSave(locals.user.id);
	return new Response(
		JSON.stringify({
			save: result.payload,
			revision: result.record.revision,
			updatedAt: result.record.updatedAt
		}),
		{ status: 200, headers: { 'content-type': 'application/json' } }
	);
};
