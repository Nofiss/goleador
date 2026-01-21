import type { MatchDto } from "@/types";
import { api } from "./axios";

export const getRecentMatches = async (): Promise<MatchDto[]> => {
	const response = await api.get<MatchDto[]>("/matches");
	return response.data;
};

export const createMatch = async (data: {
	playerHomeId: string;
	playerAwayId: string;
	scoreHome: number;
	scoreAway: number;
}) => {
	return api.post("/matches", data);
};

export const setMatchResult = async (
	matchId: string,
	data: {
		id: string;
		scoreHome: number;
		scoreAway: number;
		tableId: number | null;
		rowVersion: string;
	},
) => {
	return api.put(`/matches/${matchId}`, data);
};
