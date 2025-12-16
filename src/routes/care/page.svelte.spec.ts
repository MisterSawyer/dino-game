import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import CarePage from './+page.svelte';
import { toUserId } from '$lib/server/types.js';
import { createDefaultSave } from '$lib/pet/model.js';

vi.mock('$lib/components/DinoScene.svelte', () => ({
	default: () => ({
		$$render: () => '<div data-testid="dino-scene">3D</div>'
	})
}));

describe('/care/+page.svelte', () => {
	it('shows scene and disables actions when signed out', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		render(CarePage, {
			target,
			props: {
				data: {
					user: { id: toUserId(1), username: 'tester', createdAt: new Date().toISOString() },
					csrfToken: 'token',
					save: createDefaultSave()
				}
			}
		});

		const heading = page.getByRole('heading', { level: 1, name: /keep your companion/i });
		await expect.element(heading).toBeInTheDocument();

		const feedButton = page.getByRole('button', { name: 'Feed' }).first();
		await expect.element(feedButton).toBeDisabled();

		const scene = page.getByTestId('dino-scene');
		await expect.element(scene).toBeInTheDocument();
	});
});
