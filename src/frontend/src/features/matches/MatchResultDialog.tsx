import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/api/axios";
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
import type { TournamentMatch } from "@/types";

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
		mutationFn: async () => {
			if (!match) return;
			// Chiama l'endpoint PUT protetto
			await api.put(`/api/matches/${match.id}`, {
				id: match.id,
				scoreHome,
				scoreAway,
				tableId: tableId ? parseInt(tableId, 10) : null,
			});
		},
		onSuccess: () => {
			// Aggiorna sia le partite che la classifica del torneo!
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] });
			onClose();
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
						<Label>Tavolo da Gioco</Label>
						<Select value={tableId} onValueChange={setTableId}>
							<SelectTrigger>
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
								className="block mb-2 font-bold text-blue-700 truncate"
								title={match.homeTeamName}
							>
								{match.homeTeamName || "Casa"}
							</Label>
							<Input
								type="number"
								min="0"
								className="text-center text-2xl h-14 font-mono"
								value={scoreHome}
								onChange={(e) =>
									setScoreHome(parseInt(e.target.value, 10) || 0)
								}
							/>
						</div>

						<span className="text-xl font-bold text-gray-400">-</span>

						{/* OSPITE */}
						<div className="text-center w-1/3">
							<Label
								className="block mb-2 font-bold text-red-700 truncate"
								title={match.awayTeamName}
							>
								{match.awayTeamName || "Ospiti"}
							</Label>
							<Input
								type="number"
								min="0"
								className="text-center text-2xl h-14 font-mono"
								value={scoreAway}
								onChange={(e) =>
									setScoreAway(parseInt(e.target.value, 10) || 0)
								}
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<Button
						onClick={() => mutation.mutate()}
						disabled={mutation.isPending}
					>
						{mutation.isPending ? "Salvataggio..." : "Conferma Risultato"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
