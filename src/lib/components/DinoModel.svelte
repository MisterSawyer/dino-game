<script lang="ts">
        import { base } from '$app/paths';
        import { useLoader, useScene, useTask } from '@threlte/core';
        import { onDestroy, onMount } from 'svelte';
        import { AnimationMixer, BoxGeometry, Mesh, MeshStandardMaterial } from 'three';
        import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
        import type { PetSave } from '$lib/pet/model.js';

        const { save } = $props<{ save: PetSave }>();
        const modelPath = `${base}/models/dino.glb`;

        const loader = useLoader(GLTFLoader);
        const gltfResource = loader.load(modelPath);
        const scene = useScene();

        let gltf: GLTF | null = null;
        let mixer: AnimationMixer | null = null;
        let placeholder: Mesh<BoxGeometry, MeshStandardMaterial> | null = null;
        let idleRotation = $state(0);

        const chooseClipName = (): string => {
                const action = save.stats.lastAction.toLowerCase();
                if (action.includes('feed')) return 'eat';
                if (action.includes('sleep')) return 'sleep';
                if (action.includes('play')) return 'walk';
                return 'idle';
        };

        const activateAnimation = () => {
                if (!gltf || !mixer || gltf.animations.length === 0) {
                        return;
                }

                const preferred = chooseClipName();
                const clip = gltf.animations.find((candidate: GLTF['animations'][number]) =>
                        candidate.name.toLowerCase().includes(preferred)
                );

                const targetClip = clip ?? gltf.animations[0];
                const action = mixer.clipAction(targetClip);
                action.reset();
                action.fadeIn(0.25);
                action.play();
        };

        const addPlaceholder = () => {
                const geometry = new BoxGeometry(0.8, 0.8, 1.2);
                const material = new MeshStandardMaterial({ color: 0x34d399, metalness: 0.15, roughness: 0.65 });
                placeholder = new Mesh<BoxGeometry, MeshStandardMaterial>(geometry, material);
                placeholder.position.set(0, -0.35, 0);
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

        const addModelToScene = async () => {
                try {
                        gltf = await gltfResource.promise;
                } catch (error) {
                        console.warn('Failed to load dino model. Add a GLB at static/models/dino.glb.', error);
                        addPlaceholder();
                        return;
                }
                removePlaceholder();
                mixer = gltf.animations.length > 0 ? new AnimationMixer(gltf.scene) : null;
                gltf.scene.position.set(0, -0.35, 0);
                scene.scene.add(gltf.scene);
                activateAnimation();
        };

        const removeModelFromScene = () => {
                if (gltf) {
                        scene.scene.remove(gltf.scene);
                }
                removePlaceholder();
        };

        onMount(() => {
                addModelToScene();
                return removeModelFromScene;
        });

        onDestroy(removeModelFromScene);

        useTask((delta) => {
                idleRotation += delta * 0.25;
                if (gltf?.scene) {
                        gltf.scene.rotation.y = idleRotation;
                }
                if (placeholder) {
                        placeholder.rotation.y = idleRotation;
                }
                mixer?.update(delta);
        });

        $effect(activateAnimation);
</script>
