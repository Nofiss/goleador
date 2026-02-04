import { type HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Hook per la gestione della connessione Real-Time al torneo tramite SignalR.
 * @param tournamentId ID del torneo da monitorare.
 */
export const useTournamentHub = (tournamentId: string | undefined) => {
	const queryClient = useQueryClient();
	const connectionRef = useRef<HubConnection | null>(null);

	useEffect(() => {
		if (!tournamentId) return;

		// 1. Configurazione connessione
		const connection = new HubConnectionBuilder()
			.withUrl(`${API_BASE_URL}/hubs/tournament`)
			.withAutomaticReconnect()
			.configureLogging(LogLevel.Information)
			.build();

		// 2. Definizione eventi da ascoltare
		connection.on("MatchUpdated", (matchId: string) => {
			console.log(`[SignalR] Match ${matchId} updated. Invalidating queries...`);

			// Invalida i dati del torneo (che includono le partite) e la classifica
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] });
		});

		// 3. Avvio connessione e join al gruppo del torneo
		const startConnection = async () => {
			try {
				await connection.start();
				console.log("[SignalR] Connected to TournamentHub.");

				// Unisciti al gruppo specifico per ricevere solo notifiche di questo torneo
				await connection.invoke("JoinGroup", tournamentId);
				console.log(`[SignalR] Joined group: ${tournamentId}`);
			} catch (err) {
				console.error("[SignalR] Connection Error: ", err);
			}
		};

		startConnection();
		connectionRef.current = connection;

		// 4. Cleanup allo smontaggio del componente
		return () => {
			if (connectionRef.current) {
				console.log("[SignalR] Stopping connection...");
				connectionRef.current.stop();
			}
		};
	}, [tournamentId, queryClient]);
};
