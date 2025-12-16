import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

declare global {
	var __vitest_browser_runner__:
		| { wrapDynamicImport: <T>(fn: () => Promise<T>) => Promise<T> }
		| undefined;
}

if (process.env.VITEST && !globalThis.__vitest_browser_runner__) {
	globalThis.__vitest_browser_runner__ = {
		wrapDynamicImport: (fn) => fn()
	};
}

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],

	test: {
		expect: { requireAssertions: true },

		projects: [
			{
				extends: './vite.config.ts',

				test: {
					name: 'client',

					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},

					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',

				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
