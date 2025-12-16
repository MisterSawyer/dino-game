import type { Handle } from '@sveltejs/kit';
import { getUserBySession } from '$lib/server/auth.js';
import { ensureCsrfCookie, cookieSettings, validateCsrfToken, validateOriginHeader, SESSION_COOKIE } from '$lib/server/security.js';
import { toSessionId } from '$lib/server/types.js';

export const handle: Handle = async ({ event, resolve }) => {
        const sessionValue = event.cookies.get(SESSION_COOKIE);
        if (sessionValue) {
                const sessionUser = getUserBySession(toSessionId(sessionValue));
                if (sessionUser) {
                        event.locals.user = {
                                id: sessionUser.user.id,
                                username: sessionUser.user.username,
                                createdAt: sessionUser.user.createdAt
                        };
                        event.locals.sessionId = sessionUser.session.id;
                } else {
                        event.cookies.delete(SESSION_COOKIE, cookieSettings);
                }
        }

        event.locals.csrfToken = ensureCsrfCookie(event);

        if (!validateOriginHeader(event)) {
                return new Response('Cross-origin requests are not allowed.', { status: 403 });
        }

        if (!validateCsrfToken(event)) {
                return new Response('Invalid CSRF token.', { status: 403 });
        }

        return resolve(event);
};
