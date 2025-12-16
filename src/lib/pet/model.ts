export type PetMood = 'happy' | 'calm' | 'sleepy' | 'hungry';

export interface PetStats {
	readonly hunger: number;
	readonly energy: number;
	readonly mood: PetMood;
	readonly lastAction: string;
}

export interface InventoryState {
	readonly food: number;
	readonly toys: number;
}

export interface PetSave {
	readonly stats: PetStats;
	readonly inventory: InventoryState;
	readonly lastSeen: string;
}

const clamp = (value: number, min: number, max: number): number =>
	Math.min(max, Math.max(min, value));

const normalizeNumber = (value: unknown, fallback: number, min = 0, max = 100): number => {
	const parsed = Number(value);
	if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
		return fallback;
	}

	return clamp(parsed, min, max);
};

const normalizeMood = (value: unknown): PetMood => {
	const allowed: ReadonlyArray<PetMood> = ['happy', 'calm', 'sleepy', 'hungry'];
	if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) {
		return value as PetMood;
	}

	return 'calm';
};

const normalizeIsoDate = (value: unknown): string => {
	if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
		return value;
	}

	return new Date().toISOString();
};

export const sanitizeSavePayload = (input: unknown): PetSave => {
	const payload = (typeof input === 'object' && input !== null ? input : {}) as Record<
		string,
		unknown
	>;
	const stats = (
		typeof payload.stats === 'object' && payload.stats !== null
			? (payload.stats as Record<string, unknown>)
			: {}
	) as Record<string, unknown>;
	const inventory = (
		typeof payload.inventory === 'object' && payload.inventory !== null
			? (payload.inventory as Record<string, unknown>)
			: {}
	) as Record<string, unknown>;

	return {
		stats: {
			hunger: normalizeNumber(stats.hunger, 50),
			energy: normalizeNumber(stats.energy, 50),
			mood: normalizeMood(stats.mood),
			lastAction:
				typeof stats.lastAction === 'string' && stats.lastAction.trim().length > 0
					? stats.lastAction
					: 'Idle'
		},
		inventory: {
			food: normalizeNumber(inventory.food, 1, 0, 999),
			toys: normalizeNumber(inventory.toys, 1, 0, 999)
		},
		lastSeen: normalizeIsoDate(payload.lastSeen)
	};
};

export const createDefaultSave = (): PetSave => ({
	stats: {
		hunger: 50,
		energy: 50,
		mood: 'calm',
		lastAction: 'Idle'
	},
	inventory: { food: 3, toys: 1 },
	lastSeen: new Date().toISOString()
});
