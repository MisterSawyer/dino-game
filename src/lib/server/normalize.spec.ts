import { describe, expect, it } from 'vitest';
import { normalizeUsername } from './normalize.js';

describe('normalizeUsername', () => {
	it('trims whitespace and lowercases', () => {
		expect(normalizeUsername('  PlayerOne ')).toBe('playerone');
	});

	it('collapses interior whitespace', () => {
		expect(normalizeUsername('Dino   Trainer')).toBe('dino trainer');
	});
});
