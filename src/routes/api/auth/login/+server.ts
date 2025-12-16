import type { RequestHandler } from '@sveltejs/kit';
import { createSession, getUserByUsername, verifyPassword } from '$lib/server/auth.js';
import { SESSION_COOKIE, cookieSettings } from '$lib/server/security.js';

const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 8;

const parseCredentials = async (request: Request) => {
	try {
		const body = await request.json();
		const username = typeof body.username === 'string' ? body.username.trim() : '';
		const password = typeof body.password === 'string' ? body.password : '';
		if (username.length < MIN_USERNAME_LENGTH || password.length < MIN_PASSWORD_LENGTH) {
			return null;
		}

		return { username, password } as const;
	} catch {
		return null;
	}
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	const credentials = await parseCredentials(request);
	if (!credentials) {
		return new Response('Invalid credentials', { status: 400 });
	}

	const user = getUserByUsername(credentials.username);
	if (!user) {
		return new Response('Invalid username or password', { status: 401 });
	}

	const isValid = await verifyPassword(user, credentials.password);
	if (!isValid) {
		return new Response('Invalid username or password', { status: 401 });
	}

	const session = createSession(user.id);
	cookies.set(SESSION_COOKIE, session.id, {
		...cookieSettings,
		expires: new Date(session.expiresAt)
	});

	return new Response(
		JSON.stringify({ user: { id: user.id, username: user.username, createdAt: user.createdAt } }),
		{
			status: 200,
			headers: { 'content-type': 'application/json' }
		}
	);
};
