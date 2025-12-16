import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { persistSave, loadSave } from './save.js';
import { openDatabase } from './db.js';
import { createUserAsync } from './auth.js';
import { createDefaultSave } from '$lib/pet/model.js';

const connection = openDatabase(':memory:');

describe('save system', () => {
        afterEach(() => {
                connection.exec('DELETE FROM saves');
                connection.exec('DELETE FROM users');
        });

        afterAll(() => {
                connection.close();
        });

        it('returns a default save when none exists', async () => {
                const user = await createUserAsync({ username: 'Player', password: 'password12' }, connection);
                const save = loadSave(user.id, connection);
                expect(save.payload.stats.mood).toBe('calm');
        });

        it('increments revision when persisting', async () => {
                const user = await createUserAsync({ username: 'Saver', password: 'password12' }, connection);
                const initial = persistSave(user.id, createDefaultSave(), connection);
                const updated = persistSave(
                        user.id,
                        {
                                ...initial.payload,
                                stats: { ...initial.payload.stats, hunger: initial.payload.stats.hunger + 5, lastAction: 'Feed' }
                        },
                        connection
                );

                expect(updated.record.revision).toBeGreaterThan(initial.record.revision);
                const loaded = loadSave(user.id, connection);
                expect(loaded.record.revision).toEqual(updated.record.revision);
                expect(loaded.payload.stats.lastAction).toBe('Feed');
        });
});
