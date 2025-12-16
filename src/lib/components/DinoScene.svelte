<script lang="ts">
	import { Canvas, T } from '@threlte/core';
	import { Vector3 } from 'three';
	import type { PetSave } from '$lib/pet/model.js';
	import DinoModel from './DinoModel.svelte';

	const { save, modelPath, animationClips } = $props<{
		save: PetSave;
		modelPath?: string;
		animationClips?: {
			idle: string;
			feed: string;
			play: string;
			sleep: string;
		};
	}>();
	const sceneModelPath = $derived(modelPath ?? 'models/dino');
</script>

<div class="dino-canvas">
	<Canvas dpr={1.5}>
		<T.PerspectiveCamera makeDefault position={[6, 75, 200]} lookAt={new Vector3(0, 1, 0)} />
		<T.AmbientLight intensity={0.9} />
		<T.DirectionalLight position={[3, 5, 2]} intensity={1.4} castShadow />

		<T.Mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
			<T.PlaneGeometry args={[20, 20]} />
			<T.MeshStandardMaterial color="#0f172a" />
		</T.Mesh>

		{#key sceneModelPath}
			<DinoModel {save} modelPath={sceneModelPath} {animationClips} />
		{/key}
	</Canvas>
</div>

<style>
	.dino-canvas {
		width: 100%;
		height: 100%;
	}

	.dino-canvas :global(canvas) {
		width: 100%;
		height: 100%;
		display: block;
	}
</style>
