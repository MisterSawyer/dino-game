import type { PageServerLoad } from './$types.js';
import { loadSave } from '$lib/server/save.js';

export const load: PageServerLoad = async ({ locals }) => {
	const save = locals.user ? loadSave(locals.user.id).payload : undefined;
	return { user: locals.user, csrfToken: locals.csrfToken, save };
};
