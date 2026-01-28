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

export interface RelatedPlayerDto {
	playerId: string;
	nickname: string;
	count: number;
}

export interface MatchBriefDto {
	id: string;
	datePlayed: string;
	scoreHome: number;
	scoreAway: number;
	homeTeamName: string;
	awayTeamName: string;
	result: string; // "W", "L", "D"
}

export interface PlayerProfile {
	id: string;
	fullName: string;
	nickname: string;
	eloRating: number;
	totalMatches: number;
	goalsFor: number;
	goalsAgainst: number;
	wins: number;
	losses: number;
	winRate: number;
	nemesis?: RelatedPlayerDto;
	bestPartner?: RelatedPlayerDto;
	recentMatches: MatchBriefDto[];
}

export interface PendingMatch {
	id: string;
	tournamentId: string;
	tournamentName: string;
	homeTeamName: string;
	awayTeamName: string;
	opponentName: string;
	round: number;
	tableName?: string;
}
