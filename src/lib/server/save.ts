import { db, mapSaveRow, type DatabaseConnection } from './db.js';
import { type PetSave, sanitizeSavePayload, createDefaultSave } from '$lib/pet/model.js';
import { toRevision, type SaveRecord, type UserId } from './types.js';

const getConnection = (connection?: DatabaseConnection) => connection ?? db;

export interface SaveResult {
	readonly record: SaveRecord;
	readonly payload: PetSave;
}

export const loadSave = (userId: UserId, connection?: DatabaseConnection): SaveResult => {
	const client = getConnection(connection);
	const row = client.prepare('SELECT * FROM saves WHERE user_id = ?').get(userId);

	if (!row) {
		const fresh = createDefaultSave();
		return {
			record: {
				userId,
				revision: toRevision(0),
				updatedAt: fresh.lastSeen,
				saveJson: JSON.stringify(fresh)
			},
			payload: fresh
		};
	}

	const record = mapSaveRow(row);
	const parsed = sanitizeSavePayload(JSON.parse(record.saveJson));
	return { record, payload: parsed };
};

export const persistSave = (
	userId: UserId,
	payload: unknown,
	connection?: DatabaseConnection
): SaveResult => {
	const client = getConnection(connection);
	const parsed = sanitizeSavePayload(payload);
	const now = new Date().toISOString();
	const existing = client.prepare('SELECT revision FROM saves WHERE user_id = ?').get(userId) as
		| { revision: number }
		| undefined;
	const revision = toRevision((existing?.revision ?? 0) + 1);
	const saveJson = JSON.stringify(parsed);

	client
		.prepare(
			'INSERT INTO saves (user_id, revision, updated_at, save_json) VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET revision = excluded.revision, updated_at = excluded.updated_at, save_json = excluded.save_json'
		)
		.run(userId, revision, now, saveJson);

	return {
		record: { userId, revision, updatedAt: now, saveJson },
		payload: parsed
	};
};
