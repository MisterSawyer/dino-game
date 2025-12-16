# For AI Agents

## Project summary

- SvelteKit + adapter-node
- SQLite (.db files) backend
- App is served under /dino base path in production

Primary language: TypeScript
Framework: Svelte 5

## Hard rules

Svelte 5 runes only: $state, $derived, $effect, $props.
No deprecated Svelte APIs: do not use export let, createEventDispatcher, legacy $: reactivity, or classic store patterns unless unavoidable and explicitly requested.
TypeScript strict, always: "strict": true, "noUncheckedIndexedAccess": true, "exactOptionalPropertyTypes": true.
Strongly typed objects everywhere: no “stringly typed bags”, no ad-hoc shapes, no implicit object literals passed around without types.

## Domain modeling rules (strong typing)

All domain data must be modeled as explicit TypeScript types:
Prefer discriminated unions with kind: "...".
Prefer string union types for enumerations.
Prefer branded types for IDs to avoid mixing them accidentally.

## Boundary parsing (runtime safety + strong types)

Anything from outside the typed core must be validated:
fetch(), URL params, localStorage, user input, postMessage, etc.
Rule:
Parse at boundaries → internal app remains strongly typed.

## Svelte 5 component rules

### Props

$props() only

### State

$state for local mutable UI state

### Derived

$derived only in valid placements
Only use $derived as:
variable initializer, class field initializer, or first assignment in constructor (top-level).
Good:
const topBar = $derived(computeTopBar(state));
Bad:
calling $derived(...) as a statement
calling inside an if/loop/function body

### Effects

$effect for side effects only
No state writes in derived computations.
$effect must be deterministic and cleanup when needed.

## Events

no createEventDispatcher
Preferred pattern: typed callback props
Rules:
All callbacks must be typed.
Event payloads are typed objects (not raw DOM events) unless explicitly needed.

## State architecture rules (single source of truth)

Maintain a single canonical EditorState and derive everything else from it.
Never duplicate “sources of truth” (e.g., mode in one place, selection in another).
Use pure functions for reducers/updaters.

## No “type guessing” at call sites

Components must receive exactly the typed shape they need.
Do not pass half-constructed objects and “fill later”.
If a function expects TopBarState, the caller constructs a TopBarState exactly, not “something close”

## Never silence TypeScript errors with casts

## “Best practice defaults” checklist

Prefer Readonly / immutability for domain objects unless mutation is required.
Prefer satisfies over as.
Prefer discriminated unions over optional property puzzles.
Prefer pure functions + $derived over copying values into local state.
Prefer callback props over event dispatchers.

Output requirements for the assistant
When generating code, always:
include the relevant type definitions (or reference their import paths),
ensure the code compiles under strict TS,
avoid deprecated Svelte patterns,
avoid duplicated state,
use discriminated unions and typed actions for all state transitions.

## Testing

Always add tests for newly created or changed functionalities.
Always run all the tests, even when no files were changed.

## Linting

Always run npm run lint_fix, and fix all remaining errors.
