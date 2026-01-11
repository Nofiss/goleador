import { useQuery } from "@tanstack/react-query";
import { BarChart2, RefreshCcw } from "lucide-react";
import { useState } from "react";
import { api } from "@/api/axios";
import { getPlayers } from "@/api/players";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { PlayerStatsDialog } from "@/features/players/PlayerStatsDialog";
import type { Player } from "@/types";

export const PlayerList = () => {
	// 1. Fetch dei dati con TanStack Query
	const {
		data: players,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ["players"], // Chiave univoca per la cache
		queryFn: async () => {
			const data = await getPlayers();
			return data;
		},
	});

	const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

	if (isLoading)
		return <div className="text-center p-4">Caricamento giocatori...</div>;
	if (isError)
		return (
			<div className="text-center p-4 text-red-500">
				Errore nel caricamento.
			</div>
		);

	return (
		<>
			<div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg border shadow-sm">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold">
						Rosa Giocatori ({players?.length})
					</h2>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						<RefreshCcw className="mr-2 h-4 w-4" /> Aggiorna
					</Button>
				</div>

				<div className="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Nickname</TableHead>
								<TableHead>Nome Completo</TableHead>
								<TableHead>Email</TableHead>
								<TableHead className="text-right">Iscritto il</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{players?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="h-24 text-center">
										Nessun giocatore trovato. Aggiungine uno!
									</TableCell>
								</TableRow>
							) : (
								players?.map((player) => (
									<TableRow key={player.id}>
										<TableCell className="font-medium">
											{player.nickname}
										</TableCell>
										<TableCell>{player.fullName}</TableCell>
										<TableCell>{player.email}</TableCell>
										<TableCell className="text-right">
											{new Date(player.createdAt).toLocaleDateString("it-IT")}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setSelectedPlayerId(player.id)}
											>
												<BarChart2 className="h-4 w-4 mr-2" /> Stats
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			{/* Il Dialog vive fuori dalla tabella, ma dentro il componente */}
			<PlayerStatsDialog
				playerId={selectedPlayerId}
				onClose={() => setSelectedPlayerId(null)}
			/>
		</>
	);
};
