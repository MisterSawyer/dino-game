<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Canvas, T } from '@threlte/core';
	import { Vector3, type PerspectiveCamera, type DirectionalLight, type Object3D } from 'three';
	import { SvelteSet } from 'svelte/reactivity';
	import { findDinoBySlug, libraryDinos, type DinoAnimationKey } from '$lib/library/dinos.js';
	import { createDefaultSave } from '$lib/pet/model.js';
	import DinoModel from '$lib/components/DinoModel.svelte';
	import type { PageData } from './$types.js';

	const props = $props<{ data: PageData }>();
	const pageData = $derived(props.data);
	const activeDino = $derived(findDinoBySlug(pageData.activeDinoSlug ?? '') ?? libraryDinos[0]);
	const baseSave = createDefaultSave();
	const exploreSave = $derived({ ...baseSave, activeDinoSlug: activeDino.slug });

	type MapItemKind = 'food' | 'toy' | 'nest' | 'water';
	interface MapItem {
		readonly id: string;
		readonly kind: MapItemKind;
		readonly x: number;
		readonly y: number;
	}

	const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;
	const pickKind = (): MapItemKind => {
		const kinds: MapItemKind[] = ['food', 'toy', 'nest', 'water'];
		return kinds[Math.floor(Math.random() * kinds.length)];
	};

	let mapItems = $state<ReadonlyArray<MapItem>>([]);
	let playerPosition = $state({ x: 50, y: 70 });
	let heading = $state({ x: 0, y: -1 });
	const pressedKeys = new SvelteSet<string>();
	let animationFrame: number | null = null;
	let lastTimestamp = 0;
	const moveSpeed = 25; // units per second in map percentage space
	const worldSize = 20;
	const followDistance = 6;
	const cameraHeight = 3;
	const turnSpeed = 2.4;
	let overrideClip = $state<DinoAnimationKey | null>(null);
	let overridePlayback = $state(1);

	const generateMap = () => {
		const items: MapItem[] = [];
		for (let i = 0; i < 14; i += 1) {
			items.push({
				id: `item-${i}`,
				kind: pickKind(),
				x: randomBetween(5, 95),
				y: randomBetween(5, 95)
			});
		}
		mapItems = items;
	};

	generateMap();

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
	const normalize2D = (x: number, y: number) => {
		const length = Math.hypot(x, y);
		if (length < 1e-4) {
			return { x: 0, y: -1 };
		}
		return { x: x / length, y: y / length };
	};

	const updatePlayer = (deltaSeconds: number) => {
		const forward = normalize2D(heading.x, heading.y);

		let turnInput = 0;
		let moveInput = 0;
		if (pressedKeys.has('w')) moveInput += 1;
		if (pressedKeys.has('s')) moveInput -= 1;
		if (pressedKeys.has('a')) turnInput -= 1;
		if (pressedKeys.has('d')) turnInput += 1;

		if (turnInput !== 0) {
			const angle = turnInput * turnSpeed * deltaSeconds;
			const cosA = Math.cos(angle);
			const sinA = Math.sin(angle);
			heading = normalize2D(
				forward.x * cosA - forward.y * sinA,
				forward.x * sinA + forward.y * cosA
			);
		} else {
			heading = forward;
		}

		const step = moveSpeed * deltaSeconds * moveInput;
		playerPosition = {
			x: clamp(playerPosition.x + heading.x * step, 2, 98),
			y: clamp(playerPosition.y + heading.y * step, 2, 98)
		};

		const moveMagnitude = Math.abs(moveInput);
		const isMoving = moveMagnitude > 0;
		overrideClip = isMoving ? 'walk' : 'idle';
		let playback = isMoving ? clamp(moveMagnitude * 2.2, 0.6, 5) : 1;
		if (isMoving && moveInput < 0) {
			playback *= -1;
		}
		overridePlayback = playback;
	};

	const updateCamera = () => {
		const cam = cameraRef;
		if (!cam) return;
		const px = toWorld(playerPosition.x);
		const pz = toWorld(playerPosition.y);
		const cx = px - heading.x * followDistance;
		const cz = pz - heading.y * followDistance;
		cam.position.set(cx, cameraHeight, cz);
		cameraTarget.set(px + heading.x, 0.5, pz + heading.y);
		cam.lookAt(cameraTarget);
		cam.updateMatrixWorld();
	};

	const loop = (timestamp: number) => {
		const deltaSeconds = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0;
		lastTimestamp = timestamp;
		updatePlayer(deltaSeconds);
		updateCamera();
		animationFrame = requestAnimationFrame(loop);
	};

	onMount(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();
			if (['w', 'a', 's', 'd'].includes(key)) {
				pressedKeys.add(key);
				event.preventDefault();
			}
		};
		const handleKeyUp = (event: KeyboardEvent) => {
			const key = event.key.toLowerCase();
			pressedKeys.delete(key);
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		animationFrame = requestAnimationFrame(loop);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			if (animationFrame !== null) {
				cancelAnimationFrame(animationFrame);
			}
		};
	});

	onDestroy(() => {
		if (animationFrame !== null) {
			cancelAnimationFrame(animationFrame);
		}
	});

	const toWorld = (coord: number) => (coord / 100 - 0.5) * worldSize;
	const itemWorld = (item: MapItem) => ({ x: toWorld(item.x), z: toWorld(item.y) });
	let cameraRef = $state<PerspectiveCamera | undefined>(undefined);
	let lightRef = $state<DirectionalLight | undefined>(undefined);
	let lightTargetRef = $state<Object3D | undefined>(undefined);

	const cameraTarget = new Vector3();
	const headingDeg = $derived((Math.atan2(heading.y, heading.x) * 180) / Math.PI);
	const headingArrowDeg = $derived(headingDeg + 90);
	const headingRad = $derived(Math.atan2(heading.x, heading.y));
</script>

<svelte:head>
	<title>Explore | Dino keeper</title>
</svelte:head>

<section class="explore">
	<div class="panel scene3d">
		<div class="viewport">
			<Canvas dpr={1.5} shadows>
				<T.PerspectiveCamera makeDefault bind:ref={cameraRef} />
				<T.AmbientLight intensity={0.6} />
				<T.DirectionalLight
					position={[24, 24, 24]}
					intensity={1.2}
					castShadow
					shadow-mapSize={[4096, 4096]}
					shadow-camera-left={-80}
					shadow-camera-right={80}
					shadow-camera-top={80}
					shadow-camera-bottom={-80}
					shadow-camera-near={0.5}
					shadow-camera-far={240}
					shadow-bias={-0.0005}
					bind:ref={lightRef}
				>
					<T.Object3D bind:ref={lightTargetRef} />
				</T.DirectionalLight>

				<T.Mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
					<T.PlaneGeometry args={[worldSize, worldSize, 32, 32]} />
					<T.MeshStandardMaterial color="#0f172a" />
				</T.Mesh>

				<DinoModel
					save={exploreSave}
					modelPath={activeDino.modelPath}
					animationClips={activeDino.animationClips}
					position={[toWorld(playerPosition.x), 0.1, toWorld(playerPosition.y)]}
					rotationY={headingRad}
					overrideClip={overrideClip ? activeDino.animationClips[overrideClip] : undefined}
					playbackSpeed={overridePlayback}
					scale={0.01}
				/>

				{#each mapItems as item (item.id)}
					{@const world = itemWorld(item)}
					<T.Mesh position={[world.x, 0.35, world.z]} castShadow>
						<T.BoxGeometry args={[0.6, 0.6, 0.6]} />
						<T.MeshStandardMaterial
							color={item.kind === 'food'
								? '#bef264'
								: item.kind === 'toy'
									? '#c4b5fd'
									: item.kind === 'nest'
										? '#fcd34d'
										: '#7dd3fc'}
						/>
					</T.Mesh>
				{/each}
			</Canvas>
		</div>
	</div>
	<div class="panel map">
		<div class="map-layout">
			<div class="map-viewport" aria-label="Map overview (read-only)">
				<div class="beacon">Spawn</div>
				<div class="beacon">Oasis</div>
				<div class="beacon">Volcano</div>
				<div
					class="player"
					style={`left:${playerPosition.x}%;top:${playerPosition.y}%`}
					aria-label="Player position"
				>
					<div class="player-body"></div>
					<div
						class="heading-arrow"
						style={`transform: translate(-50%, -50%) rotate(${headingArrowDeg}deg) translate(0, -22px);`}
					></div>
				</div>
				{#each mapItems as item (item.id)}
					<div
						class={`node ${item.kind}`}
						style={`left:${item.x}%;top:${item.y}%`}
						aria-label={`Pickup: ${item.kind}`}
					>
						{item.kind === 'food'
							? 'F'
							: item.kind === 'toy'
								? 'T'
								: item.kind === 'nest'
									? 'N'
									: 'W'}
					</div>
				{/each}
			</div>
			<div class="legend">
				<div><span class="chip food">F</span>Food stash</div>
				<div><span class="chip toy">T</span>Toy cache</div>
				<div><span class="chip nest">N</span>Sleeping nest</div>
				<div><span class="chip water">W</span>Water spot</div>
				<div><span class="chip player-chip">?</span>Your dino (WASD)</div>
			</div>
		</div>
	</div>
</section>

<style>
	.explore {
		gap: 1rem;
		align-items: start;
		width: 100%;
		display: grid;
		flex: 1;
		flex-direction: column;
		min-height: 0;
	}

	.map-layout {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 0.5rem 0.75rem;
		align-items: start;
		width: 100%;
		box-sizing: border-box;
	}

	.panel {
		background: rgba(15, 23, 42, 0.75);
		border: 1px solid rgba(148, 163, 184, 0.3);
		border-radius: 14px;
		padding: 1.1rem;
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(6px);
		box-sizing: border-box;
		display: flex;
		flex: 1;
		flex-direction: column;
		min-height: 0;
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

	.hint {
		color: #94a3b8;
	}

	.link {
		color: #38bdf8;
		font-weight: 700;
		text-decoration: none;
	}

	.controls {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.label {
		margin: 0;
		color: #94a3b8;
		font-weight: 700;
	}

	.value {
		margin: 0.1rem 0 0;
	}

	.map {
		display: grid;
		gap: 0.75rem;
		grid-column: 2;
		width: 100%;
		box-sizing: border-box;
		box-sizing: border-box;
	}

	.map-viewport {
		border-radius: 12px;
		background: radial-gradient(circle at 20% 20%, rgba(14, 165, 233, 0.35), rgba(5, 9, 20, 0.9));
		border: 1px solid rgba(148, 163, 184, 0.3);
		width: 200px;
		aspect-ratio: 1 / 1;
		min-height: 220px;
		position: relative;
		overflow: hidden;
	}

	.player {
		position: absolute;
		width: 40px;
		height: 40px;
		transform: translate(-50%, -50%);
		display: grid;
		place-items: center;
	}

	.player-body {
		width: 26px;
		height: 26px;
		border-radius: 50%;
		background: linear-gradient(135deg, #34d399, #22d3ee);
		border: 2px solid rgba(255, 255, 255, 0.85);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
	}

	.heading-arrow {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-bottom: 12px solid #f8fafc;
		opacity: 0.85;
	}

	.node {
		position: absolute;
		width: 34px;
		height: 34px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.12);
		color: #0b1120;
		font-weight: 900;
		display: grid;
		place-items: center;
		transform: translate(-50%, -50%);
	}

	.node.food {
		background: #bef264;
	}
	.node.toy {
		background: #c4b5fd;
	}
	.node.nest {
		background: #fcd34d;
	}
	.node.water {
		background: #7dd3fc;
	}

	.beacon {
		position: absolute;
		padding: 0.35rem 0.7rem;
		border-radius: 999px;
		background: rgba(16, 185, 129, 0.2);
		border: 1px solid rgba(16, 185, 129, 0.4);
		color: #34d399;
		font-weight: 700;
	}

	.beacon:nth-child(1) {
		left: 18%;
		bottom: 18%;
	}

	.beacon:nth-child(2) {
		right: 22%;
		top: 35%;
	}

	.beacon:nth-child(3) {
		left: 45%;
		top: 12%;
	}

	.legend {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		color: #cbd5e1;
		font-weight: 700;
		align-self: start;
	}

	.chip {
		display: inline-grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.15);
		margin-right: 0.35rem;
		font-weight: 900;
		color: #0b1120;
	}

	.chip.food {
		background: #bef264;
	}
	.chip.toy {
		background: #c4b5fd;
	}
	.chip.nest {
		background: #fcd34d;
	}
	.chip.water {
		background: #7dd3fc;
	}
	.chip.player-chip {
		background: linear-gradient(135deg, #34d399, #22d3ee);
		color: #0b1120;
		border-color: rgba(255, 255, 255, 0.25);
	}

	.scene3d {
		grid-column: 1;
		display: flex;
		flex: 1;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.scene3d .viewport {
		flex: 1;
		flex-direction: column;
		min-height: 0;
		display: flex;
		border-radius: 12px;
		overflow: hidden;
		border: 1px solid rgba(148, 163, 184, 0.3);
		background: rgba(7, 11, 24, 0.85);
	}

	.scene3d :global(canvas) {
		width: 100%;
	}

	@media (max-width: 1000px) {
		.explore {
			grid-template-columns: 1fr;
		}

		.scene3d,
		.map {
			grid-column: 1;
		}
	}
</style>
