type Temperament = 'calm' | 'curious' | 'playful';

export interface DinoStat {
	readonly label: string;
	readonly value: number;
	readonly description: string;
}

export interface DinoProfileFact {
	readonly label: string;
	readonly value: string;
}

export interface LibraryDino {
	readonly slug: string;
	readonly name: string;
	readonly description: string;
	readonly temperament: Temperament;
	readonly accent: string;
	readonly species: string;
	readonly habitat: string;
	readonly role: string;
	readonly view: string;
	readonly favoriteSnack: string;
	readonly favoriteToy: string;
	readonly modelPath: string;
	readonly animationClips: {
		readonly idle: string;
		readonly feed: string;
		readonly play: string;
		readonly sleep: string;
		readonly walk: string;
	};
	readonly stats: ReadonlyArray<DinoStat>;
	readonly facts: ReadonlyArray<DinoProfileFact>;
}

export type DinoAnimationKey = keyof LibraryDino['animationClips'];

export const libraryDinos: ReadonlyArray<LibraryDino> = [
	{
		slug: 'ember',
		name: 'Ember',
		description: 'A curious velociraptor who loves shiny objects and sprint drills.',
		temperament: 'curious',
		accent: 'linear-gradient(135deg, #f97316, #facc15)',
		species: 'Velociraptor',
		habitat: 'Sunlit canyon roost',
		role: 'Scout / Forager',
		view: 'Lean frame, bright amber plumage, and laser focus when a trail appears.',
		favoriteSnack: 'Smoked fish jerky',
		favoriteToy: 'Chrome glider lure',
		modelPath: 'models/ember',
		animationClips: {
			idle: 'idle.fbx',
			feed: 'eat.fbx',
			play: 'play.fbx',
			sleep: 'idle.fbx',
			walk: 'walk.fbx'
		},
		stats: [
			{ label: 'Energy', value: 82, description: 'Rested and ready for long sprints.' },
			{ label: 'Curiosity', value: 95, description: 'Investigates every new scent or glint.' },
			{ label: 'Agility', value: 91, description: 'Quick cornering and sure-footed leaps.' },
			{ label: 'Bond', value: 78, description: 'Responds to whistle cues and gestures.' }
		],
		facts: [
			{ label: 'Temperament', value: 'Curious' },
			{ label: 'Habitat', value: 'Sunlit canyon roost' },
			{ label: 'Role', value: 'Scout / Forager' },
			{ label: 'Favorite snack', value: 'Smoked fish jerky' },
			{ label: 'Favorite toy', value: 'Chrome glider lure' }
		]
	},
	{
		slug: 'willow',
		name: 'Willow',
		description: 'A calm stegosaurus that enjoys sunbathing and leafy snacks.',
		temperament: 'calm',
		accent: 'linear-gradient(135deg, #34d399, #10b981)',
		species: 'Stegosaurus',
		habitat: 'Fern grove paddock',
		role: 'Guardian grazer',
		view: 'Broad plates with soft bioluminescent edges; unhurried, steady gait.',
		favoriteSnack: 'Fresh ginkgo leaves',
		favoriteToy: 'Mist arch to stroll through',
		modelPath: 'models/willow',
		animationClips: {
			idle: 'idle.fbx',
			feed: 'graze.fbx',
			play: 'play.fbx',
			sleep: 'doze.fbx',
			walk: 'walk.fbx'
		},
		stats: [
			{ label: 'Fortitude', value: 88, description: 'Steady, reliable defender of the grove.' },
			{ label: 'Sociability', value: 81, description: 'Enjoys calm walks beside the herd.' },
			{ label: 'Awareness', value: 66, description: 'Keeps an eye on the tree line.' },
			{ label: 'Patience', value: 93, description: 'Unfazed by small disruptions.' }
		],
		facts: [
			{ label: 'Temperament', value: 'Calm' },
			{ label: 'Habitat', value: 'Fern grove paddock' },
			{ label: 'Role', value: 'Guardian grazer' },
			{ label: 'Favorite snack', value: 'Fresh ginkgo leaves' },
			{ label: 'Favorite toy', value: 'Mist arch to stroll through' }
		]
	},
	{
		slug: 'nova',
		name: 'Nova',
		description: 'A playful triceratops always ready to charge into a game.',
		temperament: 'playful',
		accent: 'linear-gradient(135deg, #38bdf8, #6366f1)',
		species: 'Triceratops',
		habitat: 'Starlit mesa clearing',
		role: 'Trailblazer / Sparring partner',
		view: 'Sturdy frill with cool-toned markings; bounces before every run.',
		favoriteSnack: 'Spiced root bundles',
		favoriteToy: 'Glow-hoop toss',
		modelPath: 'models/nova',
		animationClips: {
			idle: 'idle.fbx',
			feed: 'snack.fbx',
			play: 'charge.fbx',
			sleep: 'rest.fbx',
			walk: 'walk.fbx'
		},
		stats: [
			{ label: 'Momentum', value: 86, description: 'Builds speed quickly for playful charges.' },
			{ label: 'Confidence', value: 79, description: 'Pushes into new spaces first.' },
			{ label: 'Playfulness', value: 92, description: 'Always ready for a game.' },
			{ label: 'Focus', value: 64, description: 'Needs guidance to stay on task.' }
		],
		facts: [
			{ label: 'Temperament', value: 'Playful' },
			{ label: 'Habitat', value: 'Starlit mesa clearing' },
			{ label: 'Role', value: 'Trailblazer / Sparring partner' },
			{ label: 'Favorite snack', value: 'Spiced root bundles' },
			{ label: 'Favorite toy', value: 'Glow-hoop toss' }
		]
	}
] as const;

export const findDinoBySlug = (slug: string): LibraryDino | null =>
	libraryDinos.find((entry) => entry.slug === slug) ?? null;

export const defaultDinoSlug = libraryDinos[0]?.slug ?? 'ember';
