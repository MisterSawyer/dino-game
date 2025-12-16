<script lang="ts">
        import { base } from '$app/paths';
        import DinoScene from '$lib/components/DinoScene.svelte';
        import { createDefaultSave, type PetSave } from '$lib/pet/model.js';
        import type { PageData } from './$types.js';
        import { onMount, onDestroy } from 'svelte';

        const props = $props<{ data: PageData }>();
        const pageData = $derived(props.data);

        type AuthMode = 'login' | 'register';
        let mode = $state<AuthMode>('login');
        let username = $state('');
        let password = $state('');
        let message = $state<string | null>(null);
        let user = $state<PageData['user'] | null>(null);
        let csrfToken = $state('');
        let save = $state<PetSave>(createDefaultSave());
        let isSaving = $state(false);

        $effect(() => {
                user = pageData.user ?? null;
                csrfToken = pageData.csrfToken;
                save = pageData.save ?? save;
        });

        const api = (path: string) => `${base}${path}`;

        const headers = $derived<Record<string, string>>({
                'content-type': 'application/json',
                'x-csrf-token': csrfToken
        });

        const refreshSaveFromServer = async (): Promise<void> => {
                if (!user) {
                        return;
                }
                const response = await fetch(api('/api/load'), { headers });
                if (response.ok) {
                        const payload = (await response.json()) as { save: PetSave };
                        save = payload.save;
                }
        };

        const setAuthState = (nextUser: PageData['user'] | null, nextCsrf?: string) => {
                user = nextUser;
                if (nextCsrf) {
                        csrfToken = nextCsrf;
                }
        };

        const submitAuth = async () => {
                message = null;
                const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
                const response = await fetch(api(endpoint), {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ username, password })
                });

                if (!response.ok) {
                        message = await response.text();
                        return;
                }

                const payload = (await response.json()) as { user: PageData['user'] };
                setAuthState(payload.user);
                await refreshSaveFromServer();
        };

        const handleAuthSubmit = (event: SubmitEvent) => {
                event.preventDefault();
                void submitAuth();
        };

        const logout = async () => {
                await fetch(api('/api/auth/logout'), { method: 'POST', headers });
                setAuthState(null);
                save = createDefaultSave();
        };

        const saveGame = async (state: PetSave) => {
                if (!user) {
                        return;
                }
                isSaving = true;
                const response = await fetch(api('/api/save'), {
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

        const bumpStat = (value: number, delta: number): number => Math.min(100, Math.max(0, value + delta));

        const applyAction = async (action: 'Feed' | 'Play' | 'Sleep') => {
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

        let autosaveHandle: ReturnType<typeof setInterval> | null = null;
        onMount(() => {
                autosaveHandle = setInterval(autosave, 20000);
                const onVisibility = () => {
                        if (document.visibilityState === 'hidden') {
                                autosave();
                        }
                };
                document.addEventListener('visibilitychange', onVisibility);
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
        <title>Dino care</title>
</svelte:head>

<main class="page">
        <section class="panel auth">
                <header>
                        <h1>Dino keeper</h1>
                        <p>Care for your 3D companion after signing in.</p>
                </header>
                {#if user}
                        <div class="session">
                                <p>Signed in as <strong>{user.username}</strong></p>
                                <button class="secondary" type="button" onclick={logout}>Logout</button>
                        </div>
                {:else}
                        <div class="auth-toggle">
                                <button class:active={mode === 'login'} type="button" onclick={() => (mode = 'login')}>
                                        Login
                                </button>
                                <button class:active={mode === 'register'} type="button" onclick={() => (mode = 'register')}>
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
                                                minlength="8"
                                        />
                                </label>
                                <button type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
                                {#if message}
                                        <p class="error">{message}</p>
                                {/if}
                        </form>
                {/if}
        </section>

        <section class="panel game">
                <div class="hud">
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
                        <div>
                                <p>Last action</p>
                                <span class="pill">{save.stats.lastAction}</span>
                        </div>
                </div>

                <div class="scene" data-testid="dino-scene">
                        <DinoScene save={save} />
                </div>

                <div class="actions">
                        <button type="button" onclick={() => applyAction('Feed')} disabled={!user || isSaving}>
                                Feed
                        </button>
                        <button type="button" onclick={() => applyAction('Play')} disabled={!user || isSaving}>
                                Play
                        </button>
                        <button type="button" onclick={() => applyAction('Sleep')} disabled={!user || isSaving}>
                                Sleep
                        </button>
                        <button type="button" class="secondary" onclick={autosave} disabled={!user || isSaving}>
                                Save now
                        </button>
                </div>
        </section>
</main>

<style>
        :global(body) {
                margin: 0;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                background: radial-gradient(circle at 20% 20%, #1e293b, #0b1020 60%);
                color: #e2e8f0;
        }

        main.page {
                display: grid;
                grid-template-columns: 320px 1fr;
                gap: 1.25rem;
                padding: 1.5rem;
        }

        .panel {
                background: rgba(15, 23, 42, 0.75);
                border: 1px solid rgba(148, 163, 184, 0.3);
                border-radius: 12px;
                padding: 1rem;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
                backdrop-filter: blur(6px);
        }

        .panel header h1 {
                margin: 0 0 0.25rem;
        }

        .panel header p {
                margin: 0;
                color: #cbd5e1;
                font-size: 0.95rem;
        }

        .auth-form {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                margin-top: 0.75rem;
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
                transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        button:hover:enabled {
                transform: translateY(-1px);
                box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        }

        button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
        }

        button.secondary {
                background: rgba(100, 116, 139, 0.6);
                color: #e2e8f0;
        }

        .auth-toggle {
                display: inline-flex;
                background: rgba(100, 116, 139, 0.2);
                border-radius: 12px;
                padding: 0.2rem;
                gap: 0.25rem;
        }

        .auth-toggle button {
                background: transparent;
                color: #e2e8f0;
                padding: 0.5rem 0.9rem;
        }

        .auth-toggle button.active {
                background: rgba(16, 185, 129, 0.15);
                color: #34d399;
        }

        .session {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 0.75rem;
        }

        .hud {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 0.75rem;
                margin-bottom: 1rem;
        }

        progress {
                width: 100%;
                height: 12px;
        }

        .pill {
                padding: 0.35rem 0.6rem;
                border-radius: 999px;
                background: rgba(148, 163, 184, 0.2);
        }

        .scene {
                height: 420px;
                border-radius: 12px;
                overflow: hidden;
                background: radial-gradient(circle at 20% 20%, #0ea5e9, #0b1120 60%);
                border: 1px solid rgba(148, 163, 184, 0.3);
        }

        .actions {
                margin-top: 1rem;
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
        }

        .error {
                color: #f87171;
                margin: 0;
        }

        @media (max-width: 960px) {
                main.page {
                        grid-template-columns: 1fr;
                }
        }
</style>
