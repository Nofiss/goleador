export interface Player {
	id: string;
	nickname: string;
	fullName: string;
	email: string;
	createdAt: string;
}

export interface PlayerStatistics {
	playerId: string;
	nickname: string;
	matchesPlayed: number;
	wins: number;
	draws: number;
	losses: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
	winRate: number;
	recentForm: string[]; // ["W", "L", "D"...]
}

export interface PlayerRanking {
	id: string;
	nickname: string;
	eloRating: number;
	totalMatches: number;
	winRate: number;
}
