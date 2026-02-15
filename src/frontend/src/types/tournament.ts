export const TournamentStatus = {
	setup: 0,
	active: 1,
	finished: 2,
} as const;
export type TournamentStatus = (typeof TournamentStatus)[keyof typeof TournamentStatus];

export const TournamentType = {
	roundRobin: 0,
	elimination: 1,
} as const;
export type TournamentType = (typeof TournamentType)[keyof typeof TournamentType];

export const TournamentPhase = {
	all: 0,
	firstLeg: 1,
	secondLeg: 2,
} as const;
export type TournamentPhase = (typeof TournamentPhase)[keyof typeof TournamentPhase];

export const CardEffect = {
	none: 0,
	doublePoints: 1,
} as const;
export type CardEffect = (typeof CardEffect)[keyof typeof CardEffect];

export interface TournamentCard {
	id: string;
	name: string;
	description: string;
	effect: CardEffect;
}

export interface MatchCardUsage {
	teamId: string;
	cardDefinitionId: string;
}

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
	cards?: { name: string; description: string; effect: CardEffect }[];
}

export interface TournamentTeamPlayer {
	id: string;
	nickname: string;
}

export interface TournamentTeam {
	id: string;
	name: string;
	logoUrl?: string;
	sponsorUrl?: string;
	players: TournamentTeamPlayer[];
}

export interface TournamentMatch {
	id: string;
	scoreHome: number;
	scoreAway: number;
	round: number;
	status: number;
	homeTeamId: string;
	awayTeamId: string;
	homeTeamName: string;
	awayTeamName: string;
	tableId?: number;
	tableName?: string;
	datePlayed?: string;
	rowVersion: string;
	players: TournamentTeamPlayer[];
	cardUsages: MatchCardUsage[];
}

export interface TournamentDetail extends Tournament {
	registeredPlayers: TournamentTeamPlayer[];
	teams: TournamentTeam[];
	matches: TournamentMatch[];
	cardDefinitions: TournamentCard[];
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
	matchesRemaining: number;
	pointsPerGame: number;
	projectedPoints: number;
}
