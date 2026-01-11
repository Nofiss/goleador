import axios from "axios";

export const api = axios.create({
	baseURL: "https://localhost:7063", // http://localhost:5111 - https://localhost:7063
	headers: { "Content-Type": "application/json" },
});

// Aggiungi token automaticamente
api.interceptors.request.use((config) => {
	const token = localStorage.getItem("goleador_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// Gestione scadenza token (401)
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			// Token scaduto o invalido
			localStorage.removeItem("goleador_token");
			window.location.href = "/login";
		}
		return Promise.reject(error);
	},
);
