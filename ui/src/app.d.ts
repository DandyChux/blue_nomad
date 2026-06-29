// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			navbar?: {
				position?: "fixed" | "absolute";
				variant?: "light" | "dark";
			};
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
