<script lang="ts">
	import { base, resolve } from '$app/paths';
	import { createDefaultSave, type PetSave } from '$lib/pet/model.js';
	import type { PageData } from './$types.js';

	const props = $props<{ data: PageData }>();
	const pageData = $derived(props.data);
	const dino = $derived(pageData.dino);
	let activeDinoSlug = $derived<string | null>(pageData.activeDinoSlug ?? null);
	let isSettingActive = $state(false);
	let errorMessage = $state<string | null>(null);
	const headers = $derived<Record<string, string>>({
		'content-type': 'application/json',
		'x-csrf-token': pageData.csrfToken
	});

	const setActive = async () => {
		if (!pageData.user) return;
		isSettingActive = true;
		errorMessage = null;
		const response = await fetch(`${base}/api/active`, {
			method: 'POST',
			headers,
			body: JSON.stringify({ slug: dino.slug })
		});
		isSettingActive = false;
		if (!response.ok) {
			errorMessage = await response.text();
			return;
		}
		const payload = (await response.json()) as { save: PetSave };
		activeDinoSlug = payload.save.activeDinoSlug ?? createDefaultSave().activeDinoSlug;
	};
</script>

<svelte:head>
	<title>{dino.name} | Library | Dino keeper</title>
</svelte:head>

<section class="detail">
	<div class="breadcrumb">
		<a href={resolve('/library')}>Back to library</a>
		<span aria-hidden="true">/</span>
		<span class="current">{dino.name}</span>
	</div>

	<div class="hero" style={`background-image: ${dino.accent}`}>
		<div class="hero-pane">
			<p class="eyebrow">Library profile</p>
			<h1>{dino.name}</h1>
			<p class="subtitle">{dino.species} - {dino.role}</p>
			<p class="lede">{dino.description}</p>
			<div class="chips">
				<span class="chip">Temperament: {dino.temperament}</span>
				<span class="chip">Habitat: {dino.habitat}</span>
				<span class="chip">Favorite snack: {dino.favoriteSnack}</span>
			</div>
			{#if pageData.user}
				<div class="actions">
					<button
						type="button"
						class:secondary={activeDinoSlug === dino.slug}
						disabled={isSettingActive || activeDinoSlug === dino.slug}
						onclick={setActive}
					>
						{activeDinoSlug === dino.slug ? 'Active dino' : 'Set as active'}
					</button>
					{#if errorMessage}
						<p class="error">{errorMessage}</p>
					{/if}
				</div>
			{:else}
				<p class="hint">Sign in to activate this dino for Care and Explore.</p>
			{/if}
		</div>
		<div class="view-pane">
			<p class="view-label">View</p>
			<p class="view-copy">{dino.view}</p>
			<div class="view-mark" aria-hidden="true">{dino.name.charAt(0)}</div>
			<p class="view-hint">Ready to deploy in Explore with current temperament.</p>
		</div>
	</div>

	<div class="grid">
		<div class="panel stats">
			<div class="panel-header">
				<h2>Stats</h2>
				<p class="hint">Values pulled from the latest keeper check-in.</p>
			</div>
			{#each dino.stats as stat (stat.label)}
				<div class="stat-row">
					<div class="stat-meta">
						<p class="label">{stat.label}</p>
						<p class="value">{stat.value}%</p>
					</div>
					<div class="bar">
						<div class="fill" style={`width: ${stat.value}%`}></div>
					</div>
					<p class="stat-description">{stat.description}</p>
				</div>
			{/each}
		</div>

		<div class="panel facts">
			<div class="panel-header">
				<h2>Care profile</h2>
				<p class="hint">Use these notes to prep the right session.</p>
			</div>
			<dl>
				{#each dino.facts as fact (fact.label)}
					<div class="fact">
						<dt>{fact.label}</dt>
						<dd>{fact.value}</dd>
					</div>
				{/each}
			</dl>
			<div class="callout">
				<p class="callout-title">Session idea</p>
				<p class="callout-text">
					Pair a short explore run with a reward of {dino.favoriteSnack}. Bring the
					{dino.favoriteToy} to keep focus high between waypoints.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	.detail {
		display: grid;
		gap: 1rem;
	}

	.breadcrumb {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		color: #cbd5e1;
		font-weight: 700;
	}

	.breadcrumb a {
		color: #cbd5e1;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.35rem 0.65rem;
		border-radius: 10px;
		border: 1px solid rgba(148, 163, 184, 0.35);
		background: rgba(15, 23, 42, 0.7);
	}

	.current {
		color: #e2e8f0;
	}

	.hero {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 1rem;
		padding: 1px;
		border-radius: 16px;
		background-size: 200% 200%;
		animation: shimmer 14s ease infinite;
	}

	.hero-pane,
	.view-pane {
		background: rgba(6, 10, 22, 0.9);
		padding: 1.2rem;
		border-radius: 15px;
	}

	.eyebrow {
		margin: 0;
		color: #0b1120;
		background: rgba(255, 255, 255, 0.8);
		display: inline-flex;
		align-items: center;
		padding: 0.3rem 0.6rem;
		border-radius: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 800;
	}

	h1 {
		margin: 0.25rem 0 0.3rem;
	}

	.subtitle {
		margin: 0;
		color: #cbd5e1;
		font-weight: 700;
	}

	.lede {
		color: #e2e8f0;
		line-height: 1.5;
	}

	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.8rem;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.45rem 0.7rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: #e2e8f0;
		font-weight: 700;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-top: 0.75rem;
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

	button.secondary {
		background: rgba(100, 116, 139, 0.6);
		color: #e2e8f0;
	}

	button:hover:enabled {
		transform: translateY(-1px);
		box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
	}

	button:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.error {
		margin: 0;
		color: #f87171;
		font-weight: 700;
	}

	.view-pane {
		border: 1px solid rgba(255, 255, 255, 0.18);
		display: grid;
		gap: 0.5rem;
		align-content: start;
	}

	.view-label {
		margin: 0;
		color: #cbd5e1;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 800;
	}

	.view-copy {
		margin: 0;
		color: #e2e8f0;
		line-height: 1.4;
	}

	.view-mark {
		width: 72px;
		height: 72px;
		border-radius: 16px;
		display: grid;
		place-items: center;
		background: rgba(255, 255, 255, 0.14);
		font-weight: 900;
		font-size: 1.5rem;
		color: #e2e8f0;
	}

	.view-hint {
		margin: 0;
		color: #cbd5e1;
	}

	.grid {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 1rem;
	}

	.panel {
		background: rgba(15, 23, 42, 0.82);
		border: 1px solid rgba(148, 163, 184, 0.3);
		border-radius: 14px;
		padding: 1rem;
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(8px);
	}

	.panel-header h2 {
		margin: 0;
	}

	.panel-header .hint {
		margin: 0.15rem 0 0;
	}

	.hint {
		color: #94a3b8;
	}

	.stat-row {
		margin-top: 0.65rem;
		border-radius: 12px;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(148, 163, 184, 0.18);
	}

	.stat-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.label {
		margin: 0;
		color: #cbd5e1;
		font-weight: 700;
	}

	.value {
		margin: 0;
		font-weight: 800;
		color: #e2e8f0;
	}

	.bar {
		position: relative;
		height: 10px;
		background: rgba(148, 163, 184, 0.25);
		border-radius: 999px;
		overflow: hidden;
		margin: 0.4rem 0;
	}

	.fill {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #34d399, #10b981);
	}

	.stat-description {
		margin: 0;
		color: #94a3b8;
	}

	dl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.6rem;
		margin: 0.6rem 0 0;
	}

	.fact {
		padding: 0.65rem 0.75rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid rgba(148, 163, 184, 0.2);
	}

	.fact dt {
		margin: 0;
		color: #94a3b8;
		font-weight: 700;
	}

	.fact dd {
		margin: 0.2rem 0 0;
		color: #e2e8f0;
		font-weight: 700;
	}

	.callout {
		margin-top: 0.8rem;
		padding: 0.75rem 0.8rem;
		border-radius: 12px;
		border: 1px dashed rgba(52, 211, 153, 0.4);
		background: rgba(52, 211, 153, 0.1);
	}

	.callout-title {
		margin: 0;
		font-weight: 800;
	}

	.callout-text {
		margin: 0.2rem 0 0;
		color: #cbd5e1;
		line-height: 1.5;
	}

	@keyframes shimmer {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	@media (max-width: 1000px) {
		.hero {
			grid-template-columns: 1fr;
		}

		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
