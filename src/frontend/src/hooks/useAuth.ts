import { useState } from "react";

const TOKEN_KEY = "goleador_token";
const ROLES_KEY = "goleador_roles";

export const useAuth = () => {
	const [token, setTokenState] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
	const [roles, setRolesState] = useState<string[]>(
		JSON.parse(localStorage.getItem(ROLES_KEY) || "[]"),
	);

	const login = (newToken: string, newRoles: string[]) => {
		localStorage.setItem(TOKEN_KEY, newToken);
		localStorage.setItem(ROLES_KEY, JSON.stringify(newRoles));
		setTokenState(newToken);
		setRolesState(newRoles);
	};

	const logout = () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(ROLES_KEY);
		setTokenState(null);
		setRolesState([]);
		window.location.href = "/login";
	};

	const isAdmin = roles.includes("Admin");
	const isReferee = roles.includes("Referee") || isAdmin; // Admin è anche arbitro implicitamente

	return {
		token,
		roles,
		isAdmin,
		isReferee,
		login,
		logout,
		isAuthenticated: !!token,
	};
};
