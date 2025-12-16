import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async ({ locals }) => ({
	user: locals.user ?? null,
	csrfToken: locals.csrfToken
});
