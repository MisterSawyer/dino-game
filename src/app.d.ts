import type { PetSave } from '$lib/pet/model.js';
import type { SessionId, UserId } from '$lib/server/types.js';

declare global {
	namespace App {
		interface Locals {
			user?: {
				id: UserId;
				username: string;
				createdAt: string;
			};
			sessionId?: SessionId;
			csrfToken: string;
		}

		interface PageData {
			readonly user?: Locals['user'] | null;
			readonly csrfToken: string;
			readonly save?: PetSave;
			readonly activeDinoSlug?: string | null;
			readonly dino?: unknown;
		}
	}
}

export {};
