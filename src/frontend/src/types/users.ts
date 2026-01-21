export interface User {
	id: string;
	email: string;
	username: string;
	roles: string[];
	playerId?: string;
	playerName?: string;
}
