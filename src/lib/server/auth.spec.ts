import { afterAll, afterEach, describe, expect, it } from 'vitest';
import {
	createSession,
	createUserAsync,
	deleteSession,
	getUserBySession,
	getUserByUsername,
	verifyPassword
} from './auth.js';
import { openDatabase } from './db.js';

const createConnection = () => openDatabase(':memory:');

describe('auth primitives', () => {
	const connection = createConnection();

	afterEach(() => {
		connection.exec('DELETE FROM saves');
		connection.exec('DELETE FROM sessions');
		connection.exec('DELETE FROM users');
	});

	afterAll(() => {
		connection.close();
	});

	it('creates and fetches a user with normalized lookup', async () => {
		const user = await createUserAsync(
			{ username: 'DinoMaster', password: 'secretpass1' },
			connection
		);
		const fetched = getUserByUsername('dinomaster', connection);
		expect(fetched?.id).toEqual(user.id);
		expect(await verifyPassword(fetched!, 'secretpass1')).toBe(true);
	});

	it('rejects duplicate usernames', async () => {
		await createUserAsync({ username: 'Repeat', password: 'password12' }, connection);
		await expect(() =>
			createUserAsync({ username: 'repeat', password: 'password12' }, connection)
		).rejects.toBeTruthy();
	});

	it('creates and validates sessions', async () => {
		const user = await createUserAsync(
			{ username: 'SessionUser', password: 'password12' },
			connection
		);
		const session = createSession(user.id, connection);
		const sessionUser = getUserBySession(session.id, connection);
		expect(sessionUser?.user.id).toEqual(user.id);

		deleteSession(session.id, connection);
		const missing = getUserBySession(session.id, connection);
		expect(missing).toBeNull();
	});
});
