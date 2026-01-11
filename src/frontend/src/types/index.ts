export interface Player {
    id: string;
    nickname: string;
    fullName: string;
    email: string;
    createdAt: string;
}

export const TournamentStatus = {
  Setup: 0,
  Active: 1,
  Finished: 2,
} as const;
export type TournamentStatus = (typeof TournamentStatus)[keyof typeof TournamentStatus];

export const TournamentType = {
  RoundRobin: 0,
  Elimination: 1,
} as const;
export type TournamentType = (typeof TournamentType)[keyof typeof TournamentType];

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  status: TournamentStatus;
  teamSize: number;
  hasReturnMatches: boolean;
}

export interface CreateTournamentRequest {
  name: string;
  type: TournamentType;
  teamSize: number; // 1 o 2
  hasReturnMatches: boolean;
}

export interface TournamentDetail extends Tournament {
    teams: { id: string; name: string }[];
    matches: { id: string; scoreHome: number; scoreAway: number; status: number }[];
}
