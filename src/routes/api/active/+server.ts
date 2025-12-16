import type { RequestHandler } from '@sveltejs/kit';
import { findDinoBySlug } from '$lib/library/dinos.js';
import { loadSave, persistSave } from '$lib/server/save.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return new Response('Invalid JSON payload', { status: 400 });
	}

	const parsed = (payload ?? {}) as { slug?: unknown };
	const slug = typeof parsed.slug === 'string' ? parsed.slug : '';
	const dino = findDinoBySlug(slug ?? '');
	if (!dino) {
		return new Response('Unknown dino selection', { status: 400 });
	}

	const current = loadSave(locals.user.id);
	const result = persistSave(locals.user.id, { ...current.payload, activeDinoSlug: dino.slug });

	return new Response(
		JSON.stringify({
			save: result.payload,
			revision: result.record.revision,
			updatedAt: result.record.updatedAt
		}),
		{ status: 200, headers: { 'content-type': 'application/json' } }
	);
};
