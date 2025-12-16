import type { RequestHandler } from '@sveltejs/kit';
import { persistSave } from '$lib/server/save.js';

export const POST: RequestHandler = async ({ request, locals }) => {
        if (!locals.user) {
                return new Response('Unauthorized', { status: 401 });
        }

        let payload: unknown;
        try {
                payload = await request.json();
        } catch (error) {
                return new Response('Invalid JSON payload', { status: 400 });
        }

        const result = persistSave(locals.user.id, payload);
        return new Response(
                JSON.stringify({
                        save: result.payload,
                        revision: result.record.revision,
                        updatedAt: result.record.updatedAt
                }),
                { status: 200, headers: { 'content-type': 'application/json' } }
        );
};
