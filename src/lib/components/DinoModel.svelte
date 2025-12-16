<script lang="ts">
	import { base } from '$app/paths';
	import { useLoader, useScene, useTask } from '@threlte/core';
	import { onDestroy, onMount } from 'svelte';
	import {
		AnimationMixer,
		BoxGeometry,
		Mesh,
		MeshStandardMaterial,
		type AnimationClip,
		type AnimationAction,
		type Group
	} from 'three';
	import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
	import type { PetSave } from '$lib/pet/model.js';
	import { SvelteMap } from 'svelte/reactivity';

	const {
		save,
		modelPath,
		animationClips,
		position,
		rotationY,
		scale,
		overrideClip,
		playbackSpeed
	} = $props<{
		save: PetSave;
		modelPath?: string;
		animationClips?: {
			idle: string;
			feed: string;
			play: string;
			sleep: string;
		};
		position?: [number, number, number];
		rotationY?: number;
		scale?: number | [number, number, number];
		overrideClip?: string | null;
		playbackSpeed?: number;
	}>();
	const modelBase = $derived((modelPath ?? 'models/dino').replace(/\/$/, ''));
	const targetPosition = $derived(position ?? [0, -0.35, 0]);
	const targetRotationY = $derived(rotationY ?? Math.PI / 4);
	const targetScale = $derived(
		typeof scale === 'number' ? [scale, scale, scale] : (scale ?? [1, 1, 1])
	);
	const effectivePlaybackSpeed = $derived(typeof playbackSpeed === 'number' ? playbackSpeed : 1);

	const loader = useLoader(FBXLoader);
	const scene = useScene();

	let fbx: Group | null = null;
	let animations: ReadonlyArray<AnimationClip> = [];
	let mixer: AnimationMixer | null = null;
	let currentAction: AnimationAction | null = null;
	let placeholder: Mesh<BoxGeometry, MeshStandardMaterial> | null = null;
	let loadToken = 0;
	let currentClipFile = '';
	const clipCache = new SvelteMap<string, ReadonlyArray<AnimationClip>>();

	const chooseClipName = (): string => {
		if (overrideClip && overrideClip.trim().length > 0) {
			return overrideClip;
		}
		const clips = animationClips ?? {
			idle: 'idle.fbx',
			feed: 'eat.fbx',
			play: 'play.fbx',
			sleep: 'sleep.fbx',
			walk: 'walk.fbx'
		};
		const action = save.stats.lastAction.toLowerCase();
		if (action.includes('feed')) return clips.feed;
		if (action.includes('sleep')) return clips.sleep;
		if (action.includes('play')) return clips.play;
		return clips.idle;
	};

	const pickClip = (preferred: string): AnimationClip | null => {
		const key = preferred.toLowerCase().replace(/\.fbx$/, '');
		const cached = clipCache.get(preferred);
		if (cached && cached.length > 0) {
			return cached[0];
		}
		const match = animations.find((candidate: AnimationClip) =>
			candidate.name.toLowerCase().includes(key)
		);
		return match ?? null;
	};

	const activateAnimation = (speed = 1) => {
		if (!fbx || !mixer || animations.length === 0) {
			return;
		}

		const preferred = chooseClipName();
		const clip = pickClip(preferred);

		const targetClip = clip ?? animations[0];
		const nextAction = mixer.clipAction(targetClip);
		nextAction.enabled = true;

		if (currentAction === nextAction) {
			nextAction.setEffectiveTimeScale(speed);
			nextAction.setEffectiveWeight(1);
			return;
		}

		nextAction.reset();
		nextAction.setEffectiveTimeScale(speed);
		nextAction.setEffectiveWeight(1);

		if (currentAction) {
			nextAction.crossFadeFrom(currentAction, 0.2, false);
		}

		nextAction.play();
		currentAction = nextAction;
	};

	const applyTransform = () => {
		if (fbx) {
			fbx.position.set(targetPosition[0], targetPosition[1], targetPosition[2]);
			fbx.rotation.y = targetRotationY;
			fbx.scale.set(targetScale[0], targetScale[1], targetScale[2]);
		}
		if (placeholder) {
			placeholder.position.set(targetPosition[0], targetPosition[1], targetPosition[2]);
			placeholder.rotation.y = targetRotationY;
			placeholder.scale.set(targetScale[0], targetScale[1], targetScale[2]);
		}
	};

	const addPlaceholder = () => {
		const geometry = new BoxGeometry(0.8, 0.8, 1.2);
		const material = new MeshStandardMaterial({
			color: 0x34d399,
			metalness: 0.15,
			roughness: 0.65
		});
		placeholder = new Mesh<BoxGeometry, MeshStandardMaterial>(geometry, material);
		applyTransform();
		scene.scene.add(placeholder);
	};

	const removePlaceholder = () => {
		if (!placeholder) {
			return;
		}
		scene.scene.remove(placeholder);
		placeholder.geometry.dispose();
		placeholder.material.dispose();
		placeholder = null;
	};

	const removeModelFromScene = () => {
		if (fbx) {
			scene.scene.remove(fbx);
		}
		mixer = null;
		currentAction = null;
		removePlaceholder();
	};

	const loadClipModel = async (clipFile: string) => {
		const token = ++loadToken;
		const path = `${base}/${modelBase}/${clipFile}`;
		try {
			const resource = await loader.load(path).promise;
			if (token !== loadToken) {
				return;
			}

			const loadedClips = Array.isArray(
				(resource as Group & { animations?: AnimationClip[] }).animations
			)
				? ((resource as Group & { animations?: AnimationClip[] }).animations ?? [])
				: [];
			clipCache.set(clipFile, loadedClips);

			if (!fbx) {
				fbx = resource as Group;
				animations = loadedClips;
				mixer = animations.length > 0 ? new AnimationMixer(fbx) : null;
				currentAction = null;
				removePlaceholder();
				applyTransform();
				scene.scene.add(fbx);
				fbx.traverse((child) => {
					if ('castShadow' in child) {
						(child as { castShadow?: boolean }).castShadow = true;
					}
					if ('receiveShadow' in child) {
						(child as { receiveShadow?: boolean }).receiveShadow = true;
					}
				});
				activateAnimation(effectivePlaybackSpeed);
				return;
			}

			// Merge new clips into the existing mixer; keep the current model for crossfades.
			const existingNames = new Set(animations.map((c) => c.name));
			const merged = [...animations];
			for (const clip of loadedClips) {
				if (!existingNames.has(clip.name)) {
					merged.push(clip);
				}
			}
			animations = merged;
			fbx.traverse((child) => {
				if ('castShadow' in child) {
					(child as { castShadow?: boolean }).castShadow = true;
				}
				if ('receiveShadow' in child) {
					(child as { receiveShadow?: boolean }).receiveShadow = true;
				}
			});
			activateAnimation(effectivePlaybackSpeed);
		} catch (error) {
			if (token !== loadToken) {
				return;
			}
			console.warn(`Failed to load dino model clip ${clipFile}.`, error);
			if (!fbx) {
				removeModelFromScene();
				addPlaceholder();
			}
		}
	};

	onMount(() => () => removeModelFromScene());

	onDestroy(removeModelFromScene);

	useTask((delta) => {
		mixer?.update(delta);
		applyTransform();
	});

	$effect(() => {
		currentClipFile = chooseClipName();
		void loadClipModel(currentClipFile);
	});
</script>
