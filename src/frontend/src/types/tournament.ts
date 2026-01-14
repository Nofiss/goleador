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

export interface TournamentMatch {
	id: string;
	scoreHome: number;
	scoreAway: number;
	status: number;
	homeTeamName: string;
	awayTeamName: string;
	tableId?: number;
	tableName?: string;
}

export interface TournamentDetail extends Tournament {
	teams: { id: string; name: string }[];
	matches: TournamentMatch[];
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
