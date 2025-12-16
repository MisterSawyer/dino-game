import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { createDefaultSave } from '$lib/pet/model.js';

vi.mock('$lib/components/DinoScene.svelte', () => ({
	default: () => ({
		$$render: () => '<div data-testid="dino-scene">3D</div>'
	})
}));

describe('/+page.svelte', () => {
	it('shows auth controls and scene', async () => {
		render(Page, {
			target: document.body,
			props: { data: { user: undefined, csrfToken: 'token', save: createDefaultSave() } }
		});

		const heading = page.getByRole('heading', { level: 1, name: /dino keeper/i });
		await expect.element(heading).toBeInTheDocument();

		const loginButton = page.getByRole('button', { name: 'Login' }).first();
		await expect.element(loginButton).toBeInTheDocument();

		const scene = page.getByTestId('dino-scene');
		await expect.element(scene).toBeInTheDocument();
	});
});
