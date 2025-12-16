import crypto from 'node:crypto';
import { type RequestEvent } from '@sveltejs/kit';

export const SESSION_COOKIE = 'session_id';
export const CSRF_COOKIE = 'csrf_token';
export const CSRF_HEADER = 'x-csrf-token';

const sameSite = process.env.NODE_ENV === 'production' ? 'lax' : 'lax';

export const cookieSettings = {
	httpOnly: true,
	sameSite,
	secure: process.env.NODE_ENV === 'production',
	path: '/'
} as const;

export const nonHttpOnlyCookieSettings = {
	httpOnly: false,
	sameSite,
	secure: process.env.NODE_ENV === 'production',
	path: '/'
} as const;

export const isSafeMethod = (method: string): boolean =>
	['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase());

export const validateOriginHeader = (event: RequestEvent): boolean => {
	if (isSafeMethod(event.request.method)) {
		return true;
	}

	const origin = event.request.headers.get('origin');
	const referer = event.request.headers.get('referer');
	const expectedOrigin = event.url.origin;

	if (origin && origin !== expectedOrigin) {
		return false;
	}

	if (referer) {
		try {
			const refererOrigin = new URL(referer).origin;
			if (refererOrigin !== expectedOrigin) {
				return false;
			}
		} catch (error) {
			return false;
		}
	}

	return true;
};

export const ensureCsrfCookie = (event: Pick<RequestEvent, 'cookies'>): string => {
	const existing = event.cookies.get(CSRF_COOKIE);
	if (existing) {
		return existing;
	}

	const token = crypto.randomBytes(32).toString('hex');
	event.cookies.set(CSRF_COOKIE, token, nonHttpOnlyCookieSettings);
	return token;
};

export const validateCsrfToken = (event: RequestEvent): boolean => {
	if (isSafeMethod(event.request.method)) {
		return true;
	}

	const cookieToken = event.cookies.get(CSRF_COOKIE);
	if (!cookieToken) {
		return false;
	}

	const headerToken = event.request.headers.get(CSRF_HEADER);
	return typeof headerToken === 'string' && headerToken === cookieToken;
};
