<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types.js';

	const props = $props<{ data: PageData }>();
	const pageData = $derived(props.data);
</script>

<svelte:head>
	<title>Dino keeper</title>
</svelte:head>

<section class="hero">
	<div class="copy">
		<p class="eyebrow">Welcome to your park</p>
		<h1>Care for, explore with, and collect your dinos.</h1>
		<p class="lede">
			Manage your prehistoric companions from one place. Feed them, take them on adventures, and
			review your growing library.
		</p>
		<div class="actions">
			<a class="primary" href={resolve('/care')}>Start caring</a>
			<a class="ghost" href={resolve('/library')}>View library</a>
		</div>
		{#if !pageData.user}
			<p class="hint">Sign in from the Account page to save your progress.</p>
		{:else}
			<p class="hint">Signed in as {pageData.user.username}. Jump back in!</p>
		{/if}
	</div>
	<div class="card">
		<div class="badge">Real-time stats</div>
		<div class="stat">
			<span>🦴 Inventory</span>
			<strong>Food & Toys ready</strong>
		</div>
		<div class="stat">
			<span>💤 Energy</span>
			<strong>Rested for the next adventure</strong>
		</div>
		<div class="stat">
			<span>🌿 Habitat</span>
			<strong>Eco-friendly enclosure</strong>
		</div>
	</div>
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 2rem;
		align-items: center;
	}

	.copy h1 {
		margin: 0.2rem 0 0.8rem;
		font-size: clamp(2rem, 3vw, 3rem);
		line-height: 1.1;
	}

	.eyebrow {
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
		margin: 0;
	}

	.lede {
		color: #cbd5e1;
		font-size: 1.05rem;
		line-height: 1.6;
	}

	.actions {
		display: flex;
		gap: 0.75rem;
		margin: 1rem 0 0.5rem;
	}

	a.primary,
	a.ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.85rem 1.1rem;
		border-radius: 12px;
		font-weight: 700;
		text-decoration: none;
	}

	a.primary {
		background: linear-gradient(135deg, #34d399, #10b981);
		color: #0b1120;
		box-shadow: 0 10px 25px rgba(16, 185, 129, 0.25);
	}

	a.ghost {
		color: #e2e8f0;
		border: 1px solid rgba(148, 163, 184, 0.4);
		background: rgba(148, 163, 184, 0.08);
	}

	.hint {
		color: #94a3b8;
	}

	.card {
		background: linear-gradient(180deg, rgba(37, 99, 235, 0.2), rgba(15, 23, 42, 0.85));
		border: 1px solid rgba(148, 163, 184, 0.35);
		border-radius: 16px;
		padding: 1.25rem;
		box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
		display: grid;
		gap: 0.75rem;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: rgba(16, 185, 129, 0.12);
		color: #34d399;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		font-weight: 700;
		width: fit-content;
	}

	.stat {
		background: rgba(15, 23, 42, 0.6);
		padding: 0.9rem;
		border-radius: 12px;
		border: 1px solid rgba(148, 163, 184, 0.2);
	}

	.stat span {
		display: block;
		color: #cbd5e1;
	}

	.stat strong {
		display: block;
		margin-top: 0.25rem;
		font-size: 1.05rem;
	}

	@media (max-width: 960px) {
		.hero {
			grid-template-columns: 1fr;
		}
	}
</style>
