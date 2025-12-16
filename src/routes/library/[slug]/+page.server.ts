import { findDinoBySlug } from '$lib/library/dinos.js';
import { loadSave } from '$lib/server/save.js';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(303, '/account');
	}

	const dino = findDinoBySlug(params.slug);

	if (!dino) {
		throw error(404, `No dino found for slug "${params.slug}"`);
	}

	const activeDinoSlug = loadSave(locals.user.id).payload.activeDinoSlug;

	return { dino, activeDinoSlug };
};
