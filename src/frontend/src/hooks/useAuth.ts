import { jwtDecode } from "jwt-decode";
import { useState } from "react";

const TOKEN_KEY = "goleador_token";
const REFRESH_TOKEN_KEY = "goleador_refresh_token";
const ROLES_KEY = "goleador_roles";

export const useAuth = () => {
	const [token, setTokenState] = useState<string | null>(localStorage.getItem(TOKEN_KEY));
	const [roles, setRolesState] = useState<string[]>(
		JSON.parse(localStorage.getItem(ROLES_KEY) || "[]"),
	);

	// Decode token to get userId and username (nickname)
	let userId: string | null = null;
	let username: string | null = null;

	if (token) {
		try {
			const decoded = jwtDecode<Record<string, string>>(token);
			userId =
				decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
				decoded.sub;
			username =
				decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.name;
		} catch (e) {
			console.error("Error decoding token", e);
		}
	}

	const login = (newToken: string, newRefreshToken: string, newRoles: string[]) => {
		localStorage.setItem(TOKEN_KEY, newToken);
		localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
		localStorage.setItem(ROLES_KEY, JSON.stringify(newRoles));
		setTokenState(newToken);
		setRolesState(newRoles);
	};

	const logout = () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(REFRESH_TOKEN_KEY);
		localStorage.removeItem(ROLES_KEY);
		setTokenState(null);
		setRolesState([]);
		window.location.href = "/login";
	};

	const isAdmin = roles.includes("Admin");
	const isReferee = roles.includes("Referee") || isAdmin; // Admin è anche arbitro implicitamente

	return {
		token,
		userId,
		username,
		roles,
		isAdmin,
		isReferee,
		login,
		logout,
		isAuthenticated: !!token,
	};
};
