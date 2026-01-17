import type {
	CreateTournamentRequest,
	Tournament,
	TournamentDetail,
	TournamentStanding,
} from "@/types";
import { api } from "./axios";

export const getTournaments = async (): Promise<Tournament[]> => {
	const response = await api.get<Tournament[]>("/tournaments");
	return response.data;
};

export const createTournament = async (data: CreateTournamentRequest): Promise<string> => {
	const response = await api.post<string>("/tournaments", data);
	return response.data; // Ritorna l'ID
};

export const getTournamentById = async (id: string): Promise<TournamentDetail> => {
	const response = await api.get<TournamentDetail>(`/tournaments/${id}`);
	return response.data;
};

export const registerPlayer = async (params: { tournamentId: string; playerId: string }) => {
	return api.post(`/api/tournaments/${params.tournamentId}/register-player`, params);
};

export const registerTeam = async (params: {
	tournamentId: string;
	teamName: string;
	playerIds: string[];
}) => {
	return api.post(`/tournaments/${params.tournamentId}/teams`, params);
};

export const renameTeam = async (teamId: string, newName: string) => {
	return api.put(`/api/tournaments/teams/${teamId}/rename`, { newName });
};

export const startTournament = async (id: string) => {
	return api.post(`/tournaments/${id}/start`);
};

export const getTournamentStandings = async (id: string): Promise<TournamentStanding[]> => {
	const response = await api.get<TournamentStanding[]>(`/tournaments/${id}/standings`);
	return response.data;
};

export const joinTournament = async (tournamentId: string, teamName: string) => {
	return api.post(`/tournaments/${tournamentId}/join`, { teamName });
};
