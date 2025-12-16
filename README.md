# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## 3D model asset

The 3D dinosaur model is not tracked in version control to keep the repository lean. Place your GLB at `static/models/dino.glb` (or
update the path in `src/lib/components/DinoModel.svelte`). Any `.glb` or `.gltf` files inside `static/models/` are ignored by git.

## Developing

Install dependencies with `npm install`, then start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.
