import argon2 from 'argon2';
import crypto from 'node:crypto';
import { db, mapUserRow, type DatabaseConnection } from './db.js';
import { normalizeUsername } from './normalize.js';
import {
        type SessionId,
        type SessionRecord,
        type SessionUser,
        type UserId,
        type UserRecord,
        toSessionId,
        toUserId
} from './types.js';

const sessionDurationMs = 1000 * 60 * 60 * 24 * 7;

const nowIso = (): string => new Date().toISOString();

const getConnection = (connection?: DatabaseConnection) => connection ?? db;

export interface Credentials {
        readonly username: string;
        readonly password: string;
}

export const createUserAsync = async (
        credentials: Credentials,
        connection?: DatabaseConnection
): Promise<UserRecord> => {
        const client = getConnection(connection);
        const normalized = normalizeUsername(credentials.username);
        const passwordHash = await argon2.hash(credentials.password, { type: argon2.argon2id });
        const createdAt = nowIso();

        const statement = client.prepare<unknown[]>(
                'INSERT INTO users (username, username_norm, password_hash, created_at) VALUES (?, ?, ?, ?)' 
        );
        const result = statement.run(credentials.username, normalized, passwordHash, createdAt);
        return {
                id: toUserId(Number(result.lastInsertRowid)),
                username: credentials.username,
                usernameNorm: normalized,
                passwordHash,
                createdAt
        };
};

export const getUserByUsername = (
        username: string,
        connection?: DatabaseConnection
): UserRecord | null => {
        const client = getConnection(connection);
        const normalized = normalizeUsername(username);
        const row = client.prepare('SELECT * FROM users WHERE username_norm = ?').get(normalized);
        if (!row) {
                return null;
        }

        return mapUserRow(row);
};

export const verifyPassword = async (user: UserRecord, password: string): Promise<boolean> =>
        argon2.verify(user.passwordHash, password);

export const createSession = (
        userId: UserId,
        connection?: DatabaseConnection
): SessionRecord => {
        const client = getConnection(connection);
        const id = toSessionId(crypto.randomUUID());
        const createdAt = nowIso();
        const expiresAt = new Date(Date.now() + sessionDurationMs).toISOString();

        client.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
                id,
                userId,
                createdAt,
                expiresAt
        );

        return { id, userId, createdAt, expiresAt };
};

export const deleteSession = (sessionId: SessionId, connection?: DatabaseConnection): void => {
        const client = getConnection(connection);
        client.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
};

export const getUserBySession = (
        sessionId: SessionId,
        connection?: DatabaseConnection
): SessionUser | null => {
        const client = getConnection(connection);
        const row = client
                .prepare(
                        'SELECT s.id as session_id, s.user_id as session_user_id, s.created_at as session_created_at, s.expires_at as session_expires_at, u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.id = ?'
                )
                .get(sessionId) as
                | (UserRecord & {
                          session_id: string;
                          session_user_id: number;
                          session_created_at: string;
                          session_expires_at: string;
                  })
                | undefined;

        if (!row) {
                return null;
        }

        const expired = new Date(String(row.session_expires_at)).getTime() <= Date.now();
        if (expired) {
                deleteSession(sessionId, client);
                return null;
        }

        return {
                session: {
                        id: toSessionId(String(row.session_id)),
                        userId: toUserId(Number(row.session_user_id)),
                        createdAt: String(row.session_created_at),
                        expiresAt: String(row.session_expires_at)
                },
                user: mapUserRow(row)
        };
};
