import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { setMatchResult } from "@/api/matches";
import { getTables } from "@/api/tables";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { TournamentDetail, TournamentMatch } from "@/types";

interface MatchResultDialogProps {
	match: TournamentMatch | null;
	isOpen: boolean;
	onClose: () => void;
	tournamentId: string; // Serve per invalidare la cache giusta
}

export const MatchResultDialog = ({
	match,
	isOpen,
	onClose,
	tournamentId,
}: MatchResultDialogProps) => {
	const queryClient = useQueryClient();
	const [scoreHome, setScoreHome] = useState(0);
	const [scoreAway, setScoreAway] = useState(0);
	const [tableId, setTableId] = useState<string>("");

	const { data: tables } = useQuery({
		queryKey: ["tables"],
		queryFn: getTables,
		enabled: isOpen,
	});

	// Aggiorna lo stato quando cambia il match selezionato
	useEffect(() => {
		if (match) {
			setScoreHome(match.scoreHome);
			setScoreAway(match.scoreAway);
			setTableId(match.tableId ? match.tableId.toString() : "");
		}
	}, [match]);

	const mutation = useMutation({
		mutationFn: async (variables: {
			matchId: string;
			rowVersion: string;
			scoreHome: number;
			scoreAway: number;
			tableId: number | null;
		}) => {
			await setMatchResult(variables.matchId, {
				id: variables.matchId,
				rowVersion: variables.rowVersion,
				scoreHome: variables.scoreHome,
				scoreAway: variables.scoreAway,
				tableId: variables.tableId,
			});
		},
		onMutate: async (newResult) => {
			// Cancella eventuali query in corso per evitare sovrascritture
			await queryClient.cancelQueries({ queryKey: ["tournament", tournamentId] });

			// Snapshot dei dati precedenti
			const previousTournament = queryClient.getQueryData<TournamentDetail>([
				"tournament",
				tournamentId,
			]);

			// Aggiorna manualmente la cache
			if (previousTournament) {
				queryClient.setQueryData<TournamentDetail>(["tournament", tournamentId], {
					...previousTournament,
					matches: previousTournament.matches.map((m) =>
						m.id === newResult.matchId
							? { ...m, scoreHome: newResult.scoreHome, scoreAway: newResult.scoreAway, status: 1 }
							: m,
					),
				});
			}

			// Chiudi il dialog immediatamente
			onClose();

			return { previousTournament };
		},
		onError: (error: AxiosError) => {
			if (error.response?.status === 409) {
				toast.error(
					"Attenzione: il risultato è stato modificato da un altro utente. La pagina verrà ricaricata.",
				);
				queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
				queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] });
				onClose();
			} else {
				toast.error("Si è verificato un errore durante il salvataggio.");
			}
		},
		onSettled: () => {
			// Invalida per sincronizzare con il server
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] });
		},
	});

	if (!match) return null;

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle className="text-center">Risultato & Tavolo</DialogTitle>
				</DialogHeader>

				<div className="space-y-6 py-4">
					{/* SELEZIONE TAVOLO */}
					<div className="space-y-2">
						<Label htmlFor="table-select">Tavolo da Gioco</Label>
						<Select value={tableId} onValueChange={setTableId}>
							<SelectTrigger id="table-select">
								<SelectValue placeholder="Seleziona un tavolo..." />
							</SelectTrigger>
							<SelectContent>
								{tables?.map((t) => (
									<SelectItem key={t.id} value={t.id.toString()}>
										{t.name} ({t.location})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center justify-between gap-4">
						{/* CASA */}
						<div className="text-center w-1/3">
							<Label
								htmlFor="score-home"
								className="block mb-2 font-bold text-blue-700 truncate"
								title={match.homeTeamName}
							>
								{match.homeTeamName || "Casa"}
							</Label>
							<Input
								id="score-home"
								type="number"
								min="0"
								className="text-center text-2xl h-14 font-mono"
								value={scoreHome}
								onChange={(e) => setScoreHome(parseInt(e.target.value, 10) || 0)}
								aria-label={`Punteggio ${match.homeTeamName || "Casa"}`}
							/>
						</div>

						<span className="text-xl font-bold text-gray-400">-</span>

						{/* OSPITE */}
						<div className="text-center w-1/3">
							<Label
								htmlFor="score-away"
								className="block mb-2 font-bold text-red-700 truncate"
								title={match.awayTeamName}
							>
								{match.awayTeamName || "Ospiti"}
							</Label>
							<Input
								id="score-away"
								type="number"
								min="0"
								className="text-center text-2xl h-14 font-mono"
								value={scoreAway}
								onChange={(e) => setScoreAway(parseInt(e.target.value, 10) || 0)}
								aria-label={`Punteggio ${match.awayTeamName || "Ospiti"}`}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<Button
						disabled={mutation.isPending}
						onClick={() => {
							if (!match) return;
							mutation.mutate({
								matchId: match.id,
								rowVersion: match.rowVersion,
								scoreHome,
								scoreAway,
								tableId: tableId ? parseInt(tableId, 10) : null,
							});
						}}
					>
						{mutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Salvataggio...
							</>
						) : (
							"Conferma Risultato"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
