<script lang="ts">
	import { base, resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import DinoScene from '$lib/components/DinoScene.svelte';
	import { createDefaultSave, type PetSave } from '$lib/pet/model.js';
	import { findDinoBySlug, libraryDinos } from '$lib/library/dinos.js';
	import type { PageData } from './$types.js';

	const props = $props<{ data: PageData }>();
	const pageData = $derived(props.data);

	type ActionKind = 'Feed' | 'Play' | 'Sleep';

	let user = $state<NonNullable<PageData['user']> | null>(null);
	let csrfToken = $state('');
	let save = $state<PetSave>(createDefaultSave());
	let isSaving = $state(false);
	let autosaveHandle: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		user = pageData.user ?? null;
		csrfToken = pageData.csrfToken;
		save = pageData.save ?? save;
	});

	const headers = $derived<Record<string, string>>({
		'content-type': 'application/json',
		'x-csrf-token': csrfToken
	});
	const activeDino = $derived(findDinoBySlug(save.activeDinoSlug) ?? libraryDinos[0]);
	const activeModelPath = $derived(activeDino?.modelPath ?? 'models/dino');

	const refreshSaveFromServer = async (): Promise<void> => {
		if (!user) {
			return;
		}
		const response = await fetch(`${base}/api/load`, { headers });
		if (response.ok) {
			const payload = (await response.json()) as { save: PetSave };
			save = payload.save;
		}
	};

	const saveGame = async (state: PetSave) => {
		if (!user) {
			return;
		}
		isSaving = true;
		const response = await fetch(`${base}/api/save`, {
			method: 'POST',
			headers,
			body: JSON.stringify(state)
		});
		isSaving = false;
		if (response.ok) {
			const payload = (await response.json()) as { save: PetSave };
			save = payload.save;
		}
	};

	const bumpStat = (value: number, delta: number): number =>
		Math.min(100, Math.max(0, value + delta));

	const applyAction = async (action: ActionKind) => {
		const now = new Date().toISOString();
		const updated: PetSave = {
			...save,
			stats: {
				...save.stats,
				hunger: bumpStat(save.stats.hunger, action === 'Feed' ? 20 : -5),
				energy: bumpStat(save.stats.energy, action === 'Sleep' ? 25 : -5),
				mood: action === 'Play' ? 'happy' : save.stats.mood,
				lastAction: action
			},
			lastSeen: now
		};
		save = updated;
		await saveGame(updated);
	};

	const autosave = () => saveGame({ ...save, lastSeen: new Date().toISOString() });

	onMount(() => {
		autosaveHandle = setInterval(autosave, 20000);
		const onVisibility = () => {
			if (document.visibilityState === 'hidden') {
				autosave();
			}
		};
		document.addEventListener('visibilitychange', onVisibility);
		void refreshSaveFromServer();
		return () => {
			if (autosaveHandle) {
				clearInterval(autosaveHandle);
			}
			document.removeEventListener('visibilitychange', onVisibility);
		};
	});

	onDestroy(() => {
		if (autosaveHandle) {
			clearInterval(autosaveHandle);
		}
	});
</script>

<svelte:head>
	<title>Care | Dino keeper</title>
</svelte:head>

<section class="care-grid">
	<div class="panel intro">
		<div class="header-row">
			<div>
				<p class="eyebrow">Habitat</p>
				<h1>Keep your companion thriving</h1>
				<p class="active">Active dino: {activeDino.name}</p>
			</div>
			<div class="pill">{save.stats.lastAction}</div>
		</div>
		<p class="lede">Feed, play, and rest with your dino.</p>
		{#if !user}
			<div class="notice" role="status">
				<div>
					<p class="notice-title">Not signed in</p>
					<p class="notice-text">Actions are disabled until you sign in on the Account page.</p>
				</div>
				<a class="button" href={resolve('/account')}>Go to Account</a>
			</div>
		{/if}
		<div class="stats">
			<div>
				<p>Hunger</p>
				<progress max="100" value={save.stats.hunger}></progress>
			</div>
			<div>
				<p>Energy</p>
				<progress max="100" value={save.stats.energy}></progress>
			</div>
			<div>
				<p>Mood</p>
				<span class="pill">{save.stats.mood}</span>
			</div>
		</div>
	</div>

	<div class="panel scene" data-testid="dino-scene">
		<DinoScene {save} modelPath={activeModelPath} animationClips={activeDino.animationClips} />
	</div>

	<div class="panel actions">
		<h2>Actions</h2>
		<p class="hint">Perform actions to keep your dino healthy.</p>
		<div class="action-grid">
			<button type="button" onclick={() => applyAction('Feed')} disabled={!user || isSaving}>
				Feed
			</button>
			<button type="button" onclick={() => applyAction('Play')} disabled={!user || isSaving}>
				Play
			</button>
			<button type="button" onclick={() => applyAction('Sleep')} disabled={!user || isSaving}>
				Sleep
			</button>
		</div>
	</div>
</section>

<style>
	.care-grid {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 1rem;
		align-items: start;
	}

	.panel {
		background: rgba(15, 23, 42, 0.75);
		border: 1px solid rgba(148, 163, 184, 0.3);
		border-radius: 14px;
		padding: 1.1rem;
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(6px);
	}

	.intro {
		grid-column: span 2;
	}

	.header-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.header-row h1 {
		margin: 0.1rem 0;
	}

	.eyebrow {
		margin: 0;
		color: #94a3b8;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 700;
	}

	.lede {
		color: #cbd5e1;
	}

	.active {
		margin: 0.1rem 0 0;
		color: #94a3b8;
		font-weight: 700;
	}

	.pill {
		padding: 0.45rem 0.7rem;
		border-radius: 999px;
		background: rgba(148, 163, 184, 0.16);
		border: 1px solid rgba(148, 163, 184, 0.2);
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		width: fit-content;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
	}

	progress {
		width: 100%;
		height: 12px;
	}

	.scene {
		min-height: 420px;
	}

	.actions h2 {
		margin: 0 0 0.35rem;
	}

	.hint {
		color: #94a3b8;
		margin: 0 0 0.75rem;
	}

	.action-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.5rem;
	}

	button {
		border: none;
		border-radius: 12px;
		padding: 0.85rem 1rem;
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

	button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.notice {
		margin-top: 0.75rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.85rem 1rem;
		border-radius: 12px;
		border: 1px dashed rgba(248, 180, 0, 0.5);
		background: rgba(248, 180, 0, 0.08);
	}

	.notice-title {
		margin: 0;
		font-weight: 800;
	}

	.notice-text {
		margin: 0.1rem 0 0;
		color: #fcd34d;
	}

	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.75rem 1rem;
		border-radius: 10px;
		background: linear-gradient(135deg, #38bdf8, #6366f1);
		color: #0b1120;
		text-decoration: none;
		font-weight: 700;
		white-space: nowrap;
	}

	@media (max-width: 1100px) {
		.care-grid {
			grid-template-columns: 1fr;
		}

		.intro {
			grid-column: span 1;
		}
	}
</style>
