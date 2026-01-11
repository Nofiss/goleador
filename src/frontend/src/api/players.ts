import type { Player, PlayerStatistics } from "@/types";
import { api } from "./axios";

export const getPlayers = async (): Promise<Player[]> => {
	const response = await api.get<Player[]>("/api/players");
	return response.data;
};

export const getPlayerStatistics = async (
	id: string,
): Promise<PlayerStatistics> => {
	const response = await api.get<PlayerStatistics>(
		`/api/players/${id}/statistics`,
	);
	return response.data;
};
