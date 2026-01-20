import { api } from "./axios";

export const forgotPassword = async (email: string) => {
	return api.post("/auth/forgot-password", { email });
};

export const resetPassword = async (data: {
	email: string;
	token: string;
	newPassword: string;
}) => {
	return api.post("/auth/reset-password", data);
};
