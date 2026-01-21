import type { User } from "@/types";
import { api } from "./axios";

export const getUsers = async (): Promise<User[]> => {
	const response = await api.get<User[]>("/users");
	return response.data;
};

export const updateUserRoles = async (userId: string, roles: string[]) => {
	return api.put(`/users/${userId}/roles`, { userId, newRoles: roles });
};

export const linkUserToPlayer = async (userId: string, playerId: string | null) => {
	return api.put(`/users/${userId}/link-player`, playerId);
};
