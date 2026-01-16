import type { TableItem } from "@/types";
import { api } from "./axios";

export const getTables = async (): Promise<TableItem[]> => {
	const response = await api.get<TableItem[]>("/tables");
	return response.data;
};

export const createTable = async (data: { name: string; location: string }) => {
	return api.post("/tables", data);
};

export const deleteTable = async (id: number) => {
	return api.delete(`/tables/${id}`);
};
