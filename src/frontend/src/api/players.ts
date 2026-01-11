import { api } from "./axios";
import type { Player } from "@/types";

export const getPlayers = async (): Promise<Player[]> => {
  const response = await api.get<Player[]>("/api/players");
  return response.data;
};