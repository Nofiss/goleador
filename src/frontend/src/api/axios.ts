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

let isRefreshing = false;
let failedQueue: {
	resolve: (token: string | null) => void;
	reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
	for (const prom of failedQueue) {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	}
	failedQueue = [];
};

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Se l'errore è 401 e la richiesta non è già stata riprovata
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						return api(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const refreshToken = localStorage.getItem("goleador_refresh_token");
			const accessToken = localStorage.getItem("goleador_token");

			try {
				const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
					accessToken,
					refreshToken,
				});

				const { token, refreshToken: newRefreshToken, roles } = res.data;

				localStorage.setItem("goleador_token", token);
				localStorage.setItem("goleador_refresh_token", newRefreshToken);
				localStorage.setItem("goleador_roles", JSON.stringify(roles));

				originalRequest.headers.Authorization = `Bearer ${token}`;

				processQueue(null, token);
				return api(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError, null);
				localStorage.removeItem("goleador_token");
				localStorage.removeItem("goleador_refresh_token");
				localStorage.removeItem("goleador_roles");
				window.location.href = "/login";
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
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
