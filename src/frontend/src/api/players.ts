import type { Player } from "@/types";
import { api } from "./axios";

export const getPlayers = async (): Promise<Player[]> => {
	const response = await api.get<Player[]>("/api/players");
	return response.data;
};
