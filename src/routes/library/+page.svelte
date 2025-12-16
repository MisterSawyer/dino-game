<script lang="ts">
	import { resolve } from '$app/paths';
	import { libraryDinos } from '$lib/library/dinos.js';
	import type { PageData } from './$types.js';

	const props = $props<{ data: PageData }>();
	const pageData = $derived(props.data);

	const dinos = $derived(libraryDinos);
</script>

<svelte:head>
	<title>Library | Dino keeper</title>
</svelte:head>

<section class="library">
	<header class="hero">
		<div>
			<p class="eyebrow">Library</p>
			<h1>Your roster of companions</h1>
			<p class="lede">
				Browse every dino you care for and open full profiles to inspect their stats.
			</p>
		</div>
	</header>

	<div class="cards">
		{#each dinos as dino (dino.slug)}
			<a
				class="card"
				href={resolve(`/library/${dino.slug}`)}
				style={`background-image: ${dino.accent}`}
			>
				<div class="card-inner">
					<div class="avatar" aria-hidden="true">{dino.name.charAt(0)}</div>
					<div>
						<p class="name">{dino.name}</p>
						<p class="temperament">Temperament: {dino.temperament}</p>
						{#if pageData.activeDinoSlug === dino.slug}
							<span class="pill">Active</span>
						{/if}
					</div>
				</div>
				<p class="description">{dino.description}</p>
				<span class="cta">Open profile →</span>
			</a>
		{/each}
	</div>
</section>

<style>
	.library {
		display: grid;
		gap: 1rem;
	}

	.hero {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.eyebrow {
		margin: 0;
		color: #94a3b8;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	h1 {
		margin: 0.1rem 0;
	}

	.lede {
		color: #cbd5e1;
	}

	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1rem;
	}

	.card {
		position: relative;
		overflow: hidden;
		border-radius: 16px;
		padding: 1px;
		background-size: 200% 200%;
		animation: shimmer 10s ease infinite;
		text-decoration: none;
		color: inherit;
		border: 1px solid rgba(148, 163, 184, 0.25);
		transition:
			transform 0.18s ease,
			box-shadow 0.18s ease,
			border-color 0.18s ease;
	}

	.card-inner {
		background: rgba(7, 11, 24, 0.9);
		padding: 1rem;
		border-radius: 15px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.description {
		margin: 0.75rem 1rem 1rem;
		color: #cbd5e1;
	}

	.cta {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		margin: 0 1rem 1rem;
		font-weight: 700;
		color: #0f172a;
		padding: 0.4rem 0.65rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 0 10px 20px rgba(0, 0, 0, 0.12);
	}

	.avatar {
		width: 46px;
		height: 46px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.08);
		display: grid;
		place-items: center;
		font-size: 1.25rem;
		font-weight: 800;
	}

	.name {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 800;
	}

	.temperament {
		margin: 0.2rem 0 0;
		color: #e2e8f0;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		padding: 0.25rem 0.6rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.4);
		background: rgba(255, 255, 255, 0.1);
		color: #e2e8f0;
		font-weight: 700;
		margin-top: 0.35rem;
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

	.card:hover,
	.card:focus-visible {
		transform: translateY(-2px);
		box-shadow: 0 14px 32px rgba(0, 0, 0, 0.35);
		border-color: rgba(255, 255, 255, 0.25);
		outline: none;
	}
</style>
