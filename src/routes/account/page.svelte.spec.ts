import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AccountPage from './+page.svelte';
import { toUserId } from '$lib/server/types.js';

describe('/account/+page.svelte', () => {
	it('shows auth form when logged out', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		render(AccountPage, {
			target,
			props: { data: { user: null, csrfToken: 'token' } }
		});

		const loginTab = page.getByRole('button', { name: 'Login' }).first();
		await expect.element(loginTab).toBeInTheDocument();

		const usernameField = page.getByLabelText('Username');
		await expect.element(usernameField).toBeInTheDocument();
	});

	it('hides auth form when logged in', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		render(AccountPage, {
			target,
			props: {
				data: {
					user: { id: toUserId(1), username: 'sarah', createdAt: '2023-01-01T00:00:00.000Z' },
					csrfToken: 'token'
				}
			}
		});

		const logoutButton = page.getByRole('button', { name: 'Logout' });
		await expect.element(logoutButton).toBeInTheDocument();

		const usernameField = document.querySelector('input[aria-label="Username"]');
		expect(usernameField).toBeNull();
	});
});
