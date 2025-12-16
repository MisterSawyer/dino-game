import type { PageServerLoad } from './$types.js';
import { loadSave } from '$lib/server/save.js';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/account');
	}

	const save = locals.user ? loadSave(locals.user.id).payload : undefined;
	return { user: locals.user, csrfToken: locals.csrfToken, save };
};
