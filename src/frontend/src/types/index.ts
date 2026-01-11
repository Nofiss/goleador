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

export const TournamentStatus = {
	Setup: 0,
	Active: 1,
	Finished: 2,
} as const;
export type TournamentStatus =
	(typeof TournamentStatus)[keyof typeof TournamentStatus];

export const TournamentType = {
	RoundRobin: 0,
	Elimination: 1,
} as const;
export type TournamentType =
	(typeof TournamentType)[keyof typeof TournamentType];

export interface Tournament {
	id: string;
	name: string;
	type: TournamentType;
	status: TournamentStatus;
	teamSize: number;
	hasReturnMatches: boolean;
}

export interface ScoringRules {
	pointsForWin: number;
	pointsForDraw: number;
	pointsForLoss: number;
	goalThreshold: number | null;
	goalThresholdBonus: number;
	enableTenZeroBonus: boolean;
	tenZeroBonus: number;
}

export interface CreateTournamentRequest {
	name: string;
	type: TournamentType;
	teamSize: number; // 1 o 2
	hasReturnMatches: boolean;
	notes?: string;
	// Scoring fields (appiattiti nel command backend, appiattiamoli anche qui per semplicità di form)
	pointsForWin: number;
	pointsForDraw: number;
	pointsForLoss: number;
	goalThreshold?: number;
	goalThresholdBonus: number;
	enableTenZeroBonus: boolean;
	tenZeroBonus: number;
}

export interface TournamentDetail extends Tournament {
	teams: { id: string; name: string }[];
	matches: {
		id: string;
		scoreHome: number;
		scoreAway: number;
		status: number;
	}[];
	notes?: string;
	scoringRules: ScoringRules;
}

export interface TournamentStanding {
	teamId: string;
	teamName: string;
	position: number;
	points: number;
	played: number;
	won: number;
	drawn: number;
	lost: number;
	goalsFor: number;
	goalsAgainst: number;
	goalDifference: number;
}
