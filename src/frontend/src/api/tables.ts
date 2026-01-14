import type { TableItem } from "@/types";
import { api } from "./axios";

export const getTables = async (): Promise<TableItem[]> => {
	const response = await api.get<TableItem[]>("/api/tables");
	return response.data;
};

export const createTable = async (data: { name: string; location: string }) => {
	return api.post("/api/tables", data);
};

export const deleteTable = async (id: number) => {
	return api.delete(`/api/tables/${id}`);
};
