<script lang="ts">
	import { base } from '$app/paths';
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types.js';

	const props = $props<{ data: PageData }>();
	const pageData = $derived(props.data);

	type AuthMode = 'login' | 'register';

	let user = $state<NonNullable<PageData['user']> | null>(null);
	let csrfToken = $state('');
	let mode = $state<AuthMode>('login');
	let username = $state('');
	let password = $state('');
	let message = $state<string | null>(null);
	let isSubmitting = $state(false);

	$effect(() => {
		user = pageData.user ?? null;
		csrfToken = pageData.csrfToken;
	});

	const headers = $derived<Record<string, string>>({
		'content-type': 'application/json',
		'x-csrf-token': csrfToken
	});

	const submitAuth = async () => {
		message = null;
		isSubmitting = true;
		const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
		const response = await fetch(`${base}${endpoint}`, {
			method: 'POST',
			headers,
			body: JSON.stringify({ username, password })
		});
		isSubmitting = false;

		if (!response.ok) {
			message = await response.text();
			return;
		}

		const payload = (await response.json()) as { user: NonNullable<PageData['user']> };
		user = payload.user;
		username = '';
		password = '';
		await invalidateAll();
	};

	const handleAuthSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		void submitAuth();
	};

	const logout = async () => {
		await fetch(`${base}/api/auth/logout`, { method: 'POST', headers });
		user = null;
		await invalidateAll();
	};
</script>

<svelte:head>
	<title>Account | Dino keeper</title>
</svelte:head>

<section class="account-grid">
	<div class="panel profile">
		<p class="eyebrow">Account</p>
		<h1>Your keeper profile</h1>
		{#if user}
			<p class="hint">Logged in as {user.username}.</p>
			<button type="button" class="secondary" onclick={logout}>Logout</button>
		{:else}
			<p class="hint">Sign in or create an account to save your dinos.</p>
			<div class="auth-toggle">
				<button class:active={mode === 'login'} type="button" onclick={() => (mode = 'login')}>
					Login
				</button>
				<button
					class:active={mode === 'register'}
					type="button"
					onclick={() => (mode = 'register')}
				>
					Register
				</button>
			</div>
			<form class="auth-form" onsubmit={handleAuthSubmit}>
				<label>
					Username
					<input
						name="username"
						value={username}
						oninput={(event) => (username = event.currentTarget.value)}
						autocomplete="username"
						required
						minlength="3"
						aria-label="Username"
					/>
				</label>
				<label>
					Password
					<input
						name="password"
						type="password"
						value={password}
						oninput={(event) => (password = event.currentTarget.value)}
						autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
						required
						minlength="4"
						aria-label="Password"
					/>
				</label>
				<button type="submit" disabled={isSubmitting}>
					{mode === 'login' ? 'Login' : 'Create account'}
				</button>
				{#if message}
					<p class="error">{message}</p>
				{/if}
			</form>
		{/if}
	</div>
</section>

<style>
	.account-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1rem;
		max-width: 720px;
		margin: 0 auto;
	}

	.panel {
		background: rgba(15, 23, 42, 0.75);
		border: 1px solid rgba(148, 163, 184, 0.3);
		border-radius: 14px;
		padding: 1.1rem;
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(6px);
	}

	.eyebrow {
		margin: 0;
		color: #94a3b8;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	h1 {
		margin: 0.35rem 0 0.5rem;
	}

	.hint {
		color: #94a3b8;
	}

	.auth-toggle {
		display: inline-flex;
		background: rgba(100, 116, 139, 0.2);
		border-radius: 12px;
		padding: 0.2rem;
		gap: 0.25rem;
		margin: 0.75rem 0;
	}

	.auth-toggle button {
		background: transparent;
		color: #e2e8f0;
		padding: 0.6rem 0.95rem;
		border-radius: 10px;
		font-weight: 700;
	}

	.auth-toggle button.active {
		background: rgba(16, 185, 129, 0.15);
		color: #34d399;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-weight: 600;
	}

	input {
		border-radius: 8px;
		border: 1px solid rgba(148, 163, 184, 0.5);
		background: rgba(15, 23, 42, 0.6);
		color: #e2e8f0;
		padding: 0.6rem 0.75rem;
	}

	button {
		border: none;
		border-radius: 10px;
		padding: 0.75rem 1rem;
		font-weight: 700;
		background: linear-gradient(135deg, #34d399, #10b981);
		color: #0b1120;
		cursor: pointer;
		transition:
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	button:hover:enabled {
		transform: translateY(-1px);
		box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
	}

	button.secondary {
		background: rgba(100, 116, 139, 0.6);
		color: #e2e8f0;
	}

	.error {
		color: #f87171;
		margin: 0;
	}

	@media (max-width: 900px) {
		.account-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
