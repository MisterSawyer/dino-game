export const normalizeUsername = (username: string): string =>
	username.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US');
