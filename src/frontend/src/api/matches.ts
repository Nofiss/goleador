import type { MatchDto } from "@/types";
import { api } from "./axios";

export const getRecentMatches = async (): Promise<MatchDto[]> => {
	const response = await api.get<MatchDto[]>("/api/matches");
	return response.data;
};

export const createMatch = async (data: {
	playerHomeId: string;
	playerAwayId: string;
	scoreHome: number;
	scoreAway: number;
}) => {
	return api.post("/api/matches", data);
};
