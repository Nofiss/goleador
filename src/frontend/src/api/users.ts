import { api } from "./axios";
import type { User } from "@/types";

export const getUsers = async (): Promise<User[]> => {
    const response = await api.get<User[]>("/api/users");
    return response.data;
};

export const updateUserRoles = async (userId: string, roles: string[]) => {
    return api.put(`/api/users/${userId}/roles`, { userId, newRoles: roles });
};

export const linkUserToPlayer = async (userId: string, playerId: string | null) => {
    return api.put(`/api/users/${userId}/link-player`, playerId );
};
