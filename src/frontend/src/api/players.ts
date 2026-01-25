import type { Player, PlayerProfile, PlayerRanking, PlayerStatistics } from "@/types";
import { api } from "./axios";

export const getPlayers = async (): Promise<Player[]> => {
	const response = await api.get<Player[]>("/players");
	return response.data;
};

export const getPlayerStatistics = async (id: string): Promise<PlayerStatistics> => {
	const response = await api.get<PlayerStatistics>(`/players/${id}/statistics`);
	return response.data;
};

export const getGlobalRanking = async (): Promise<PlayerRanking[]> => {
	const response = await api.get<PlayerRanking[]>("/players/ranking");
	return response.data;
};

export const getPlayerProfile = async (id?: string): Promise<PlayerProfile> => {
	const endpoint = id ? `/players/${id}/profile` : "/players/me/profile";
	const response = await api.get<PlayerProfile>(endpoint);
	return response.data;
};
