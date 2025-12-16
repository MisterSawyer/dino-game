<script lang="ts">
	import './layout.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import favicon from '$lib/assets/favicon.svg';
	import type { LayoutData } from './$types.js';

	const props = $props<{ children: () => unknown; data: LayoutData }>();
	const layoutData = $derived(props.data);
	const renderChildren = $derived(props.children);

	type NavPath = '/care' | '/explore' | '/library';
	const navLinks: ReadonlyArray<{ readonly path: NavPath; readonly label: string }> = [
		{ path: '/care', label: 'Care' },
		{ path: '/explore', label: 'Explore' },
		{ path: '/library', label: 'Library' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app-shell">
	<header class="top-bar">
		<div class="brand">
			<span class="logo">🦖</span>
			<div>
				<p class="eyebrow">Dino keeper</p>
				<p class="title">Your prehistoric companion hub</p>
			</div>
		</div>
		{#if layoutData.user}
			<nav aria-label="Primary" class="nav">
				{#each navLinks as link (link.path)}
					<a href={resolve(link.path)} class:active={$page.url.pathname === resolve(link.path)}>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}
		<a class="session-pill" href={resolve('/account')}>
			{#if layoutData.user}
				<span class="status-dot" aria-hidden="true"></span>
				<span class="session-text">Signed in as {layoutData.user.username}</span>
			{:else}
				<span class="status-dot anonymous" aria-hidden="true"></span>
				<span class="session-text">Sign in to start caring</span>
			{/if}
		</a>
	</header>

	<main class="page-body">{@render renderChildren()}</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family:
			'Inter',
			system-ui,
			-apple-system,
			sans-serif;
		background: radial-gradient(circle at 20% 20%, #0d1b2a, #050914 70%);
		color: #e2e8f0;
		min-height: 100vh;
	}

	.app-shell {
		min-height: 100vh;
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.top-bar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1.25rem 1.75rem;
		position: sticky;
		top: 0;
		z-index: 10;
		background: rgba(10, 17, 33, 0.9);
		border-bottom: 1px solid rgba(148, 163, 184, 0.25);
		backdrop-filter: blur(10px);
		flex-wrap: wrap;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.logo {
		display: grid;
		place-items: center;
		width: 44px;
		height: 44px;
		border-radius: 12px;
		background: linear-gradient(135deg, #22d3ee, #6366f1);
		box-shadow: 0 10px 30px rgba(99, 102, 241, 0.25);
	}

	.eyebrow {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.8rem;
		color: #94a3b8;
	}

	.title {
		margin: 0;
		font-weight: 700;
		font-size: 1.1rem;
	}

	.nav {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
		flex: 1 1 auto;
		min-width: 240px;
	}

	.nav a {
		padding: 0.65rem 0.85rem;
		border-radius: 10px;
		color: #e2e8f0;
		text-decoration: none;
		font-weight: 600;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			transform 0.15s ease;
	}

	.nav a:hover,
	.nav a:focus-visible {
		background: rgba(148, 163, 184, 0.15);
		outline: none;
	}

	.nav a.active {
		background: linear-gradient(135deg, #34d399, #10b981);
		color: #0b1120;
		box-shadow: 0 8px 18px rgba(16, 185, 129, 0.25);
	}

	.session-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.9rem;
		border-radius: 999px;
		background: rgba(148, 163, 184, 0.12);
		border: 1px solid rgba(148, 163, 184, 0.25);
		min-width: 0;
		text-decoration: none;
		color: inherit;
		margin-left: auto;
	}

	.session-text {
		color: #e2e8f0;
		font-weight: 600;
		text-decoration: none;
	}

	.status-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: #22c55e;
		box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.15);
	}

	.status-dot.anonymous {
		background: #94a3b8;
		box-shadow: none;
	}

	.page-body {
		padding: 1.5rem;
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
		width: 100%;
		box-sizing: border-box;
	}

	@media (max-width: 960px) {
		.top-bar {
			flex-direction: column;
			align-items: flex-start;
		}

		.nav {
			width: 100%;
			flex-wrap: wrap;
			justify-content: flex-start;
		}

		.session-pill {
			width: auto;
			margin-left: 0;
		}
	}
</style>
