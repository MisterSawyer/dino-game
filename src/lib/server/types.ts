export type UserId = number & { readonly brand: 'UserId' };
export type SessionId = string & { readonly brand: 'SessionId' };
export type SaveRevision = number & { readonly brand: 'SaveRevision' };

export interface UserRecord {
        readonly id: UserId;
        readonly username: string;
        readonly usernameNorm: string;
        readonly passwordHash: string;
        readonly createdAt: string;
}

export interface SessionRecord {
        readonly id: SessionId;
        readonly userId: UserId;
        readonly createdAt: string;
        readonly expiresAt: string;
}

export interface SaveRecord {
        readonly userId: UserId;
        readonly revision: SaveRevision;
        readonly updatedAt: string;
        readonly saveJson: string;
}

export interface SessionUser {
        readonly user: UserRecord;
        readonly session: SessionRecord;
}

export const toUserId = (id: number): UserId => id as UserId;
export const toSessionId = (value: string): SessionId => value as SessionId;
export const toRevision = (value: number): SaveRevision => value as SaveRevision;
