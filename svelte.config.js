import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const base = process.env.SVELTEKIT_BASE ?? '';

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ out: 'build' }),
		paths: { base }
	}
};
