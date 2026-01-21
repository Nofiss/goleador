import axios, { type AxiosRequestConfig } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
	// biome-ignore lint/style/useNamingConvention: Axios Property
	baseURL: `${API_BASE_URL}/api`,
	headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("goleador_token");
		if (token) {
			if (config.headers) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}
		return config;
	},
	(error) => Promise.reject(error),
);

api.interceptors.response.use(
	(response) => response,
	(error) => {
		// Gestione Token Scaduto/Mancante (401)
		if (error.response?.status === 401) {
			localStorage.removeItem("goleador_token");
			localStorage.removeItem("goleador_roles");
			window.location.href = "/login";
		}

		// Gestione Permessi Insufficienti (403) - NON fare redirect, mostra errore
		if (error.response?.status === 403) {
			console.error("Non hai i permessi per questa azione.");
		}

		return Promise.reject(error);
	},
);

/**
 * Funzione mutator personalizzata per Orval.
 * Utilizza l'istanza axios `api` pre-configurata con interceptors.
 */
export const customInstance = <T>(
	config: AxiosRequestConfig,
	options?: AxiosRequestConfig,
): Promise<T> => {
	return api({
		...config,
		...options,
	}).then((response) => response.data);
};
