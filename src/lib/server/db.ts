import Database, { type Database as SQLiteDatabase } from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import {
	toRevision,
	toSessionId,
	toUserId,
	type SaveRecord,
	type SessionRecord,
	type UserRecord
} from './types.js';

const defaultPath = process.env.SQLITE_PATH ?? './data/game.db';

const ensureDirectory = (filePath: string): void => {
	const directory = path.dirname(filePath);
	if (filePath === ':memory:' || filePath === '' || fs.existsSync(directory)) {
		return;
	}

	fs.mkdirSync(directory, { recursive: true });
};

const applyPragmas = (connection: SQLiteDatabase): void => {
	connection.pragma('journal_mode = WAL');
	connection.pragma('foreign_keys = ON');
};

export type DatabaseConnection = SQLiteDatabase;

const runMigrations = (connection: SQLiteDatabase): void => {
	connection.exec(`
                CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL,
                        username_norm TEXT NOT NULL UNIQUE,
                        password_hash TEXT NOT NULL,
                        created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS sessions (
                        id TEXT PRIMARY KEY,
                        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        created_at TEXT NOT NULL,
                        expires_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS saves (
                        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
                        revision INTEGER NOT NULL DEFAULT 0,
                        updated_at TEXT NOT NULL,
                        save_json TEXT NOT NULL
                );
        `);
};

export const openDatabase = (sqlitePath: string = defaultPath): SQLiteDatabase => {
	if (sqlitePath !== ':memory:') {
		ensureDirectory(sqlitePath);
	}

	const connection = new Database(sqlitePath);
	applyPragmas(connection);
	runMigrations(connection);
	return connection;
};

export const db = openDatabase();

type RowRecord = Readonly<Record<string, unknown>>;

export const mapUserRow = (row: RowRecord): UserRecord => ({
	id: toUserId(Number(row.id)),
	username: String(row.username),
	usernameNorm: String(row.username_norm),
	passwordHash: String(row.password_hash),
	createdAt: String(row.created_at)
});

export const mapSessionRow = (row: RowRecord): SessionRecord => ({
	id: toSessionId(String(row.id)),
	userId: toUserId(Number(row.user_id)),
	createdAt: String(row.created_at),
	expiresAt: String(row.expires_at)
});

export const mapSaveRow = (row: RowRecord): SaveRecord => ({
	userId: toUserId(Number(row.user_id)),
	revision: toRevision(Number(row.revision)),
	updatedAt: String(row.updated_at),
	saveJson: String(row.save_json)
});
