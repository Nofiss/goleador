import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { motion } from "framer-motion";
import { ArrowLeftRight, Table, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { setMatchResult } from "@/api/matches";
import { getTables } from "@/api/tables";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cn } from "@/lib/utils";
import type { TournamentCard, TournamentDetail, TournamentMatch } from "@/types";

interface MatchResultDialogProps {
	match: TournamentMatch | null;
	isOpen: boolean;
	onClose: () => void;
	tournamentId: string; // Serve per invalidare la cache giusta
	cardDefinitions?: TournamentCard[];
	allMatches?: TournamentMatch[];
}

export const MatchResultDialog = ({
	match,
	isOpen,
	onClose,
	tournamentId,
	cardDefinitions = [],
	allMatches = [],
}: MatchResultDialogProps) => {
	const queryClient = useQueryClient();
	const [scoreHome, setScoreHome] = useState(0);
	const [scoreAway, setScoreAway] = useState(0);
	const [tableId, setTableId] = useState<string>("");
	const [selectedHomeCardIds, setSelectedHomeCardIds] = useState<string[]>([]);
	const [selectedAwayCardIds, setSelectedAwayCardIds] = useState<string[]>([]);

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

			// Inizializza carte già selezionate
			setSelectedHomeCardIds(
				match.cardUsages
					?.filter((cu) => cu.teamId === match.homeTeamId)
					.map((cu) => cu.cardDefinitionId) || [],
			);
			setSelectedAwayCardIds(
				match.cardUsages
					?.filter((cu) => cu.teamId === match.awayTeamId)
					.map((cu) => cu.cardDefinitionId) || [],
			);
		}
	}, [match]);

	// Calcola quali carte sono state già usate dai due team in ALTRE partite
	const usedCardIdsByTeam = useMemo(() => {
		const map = new Map<string, Set<string>>();
		if (!match) return map;

		for (const m of allMatches) {
			if (m.id === match.id) continue; // Salta questa partita

			for (const cu of m.cardUsages || []) {
				if (!map.has(cu.teamId)) {
					map.set(cu.teamId, new Set());
				}
				map.get(cu.teamId)?.add(cu.cardDefinitionId);
			}
		}
		return map;
	}, [allMatches, match]);

	const mutation = useMutation({
		mutationFn: async (variables: {
			matchId: string;
			rowVersion: string;
			scoreHome: number;
			scoreAway: number;
			tableId: number | null;
			usedCards: { cardDefinitionId: string; teamId: string }[];
		}) => {
			await setMatchResult(variables.matchId, {
				id: variables.matchId,
				rowVersion: variables.rowVersion,
				scoreHome: variables.scoreHome,
				scoreAway: variables.scoreAway,
				tableId: variables.tableId,
				usedCards: variables.usedCards,
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
						<div className="relative">
							<Select value={tableId} onValueChange={setTableId}>
								<SelectTrigger id="table-select" className="pl-9 w-full">
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
							<Table
								className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 z-10 pointer-events-none"
								aria-hidden="true"
							/>
						</div>
					</div>

					<div className="flex items-center justify-between gap-4">
						{/* CASA */}
						<div className="text-center w-1/3">
							<Label
								htmlFor="score-home"
								className="block mb-2 font-bold text-blue-600 dark:text-blue-400 truncate"
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

						<div className="flex flex-col items-center gap-1">
							<span className="text-xl font-bold text-muted-foreground/40">-</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
								onClick={() => {
									const temp = scoreHome;
									setScoreHome(scoreAway);
									setScoreAway(temp);
								}}
								aria-label="Scambia punteggi"
								title="Scambia punteggi"
							>
								<motion.div
									whileHover={{ rotate: 180 }}
									whileTap={{ scale: 0.8, rotate: 180 }}
									transition={{ type: "spring", stiffness: 300, damping: 15 }}
								>
									<ArrowLeftRight className="h-4 w-4" />
								</motion.div>
							</Button>
						</div>

						{/* OSPITE */}
						<div className="text-center w-1/3">
							<Label
								htmlFor="score-away"
								className="block mb-2 font-bold text-red-600 dark:text-red-400 truncate"
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

					{/* SELEZIONE CARTE */}
					{cardDefinitions.length > 0 && (
						<div className="space-y-4 pt-4 border-t">
							<div className="flex items-center gap-2 mb-2">
								<Zap className="h-4 w-4 text-yellow-500" />
								<span className="text-sm font-semibold">Carte Giocate</span>
							</div>

							<div className="grid grid-cols-2 gap-8">
								{/* CARTE CASA */}
								<div className="space-y-2">
									<p className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 mb-1">
										Carte {match.homeTeamName}
									</p>
									{cardDefinitions.map((card) => {
										const isUsedByThisTeam = usedCardIdsByTeam.get(match.homeTeamId)?.has(card.id);
										const isSelected = selectedHomeCardIds.includes(card.id);

										return (
											<div
												key={card.id}
												className={cn(
													"flex items-start space-x-2 p-2 rounded border transition-colors",
													isUsedByThisTeam ? "opacity-40 bg-muted" : "hover:bg-muted/50",
													isSelected && "border-primary bg-primary/5",
												)}
											>
												<Checkbox
													id={`card-home-${card.id}`}
													disabled={isUsedByThisTeam}
													checked={isSelected}
													onCheckedChange={(checked) => {
														if (checked) {
															setSelectedHomeCardIds([...selectedHomeCardIds, card.id]);
														} else {
															setSelectedHomeCardIds(
																selectedHomeCardIds.filter((id) => id !== card.id),
															);
														}
													}}
												/>
												<div className="grid gap-1.5 leading-none">
													<label
														htmlFor={`card-home-${card.id}`}
														className="text-xs font-medium leading-none cursor-pointer"
													>
														{card.name}
													</label>
													<p className="text-[10px] text-muted-foreground line-clamp-1">
														{card.description}
													</p>
												</div>
											</div>
										);
									})}
								</div>

								{/* CARTE OSPITE */}
								<div className="space-y-2">
									<p className="text-[10px] uppercase font-bold text-red-600 dark:text-red-400 mb-1">
										Carte {match.awayTeamName}
									</p>
									{cardDefinitions.map((card) => {
										const isUsedByThisTeam = usedCardIdsByTeam.get(match.awayTeamId)?.has(card.id);
										const isSelected = selectedAwayCardIds.includes(card.id);

										return (
											<div
												key={card.id}
												className={cn(
													"flex items-start space-x-2 p-2 rounded border transition-colors",
													isUsedByThisTeam ? "opacity-40 bg-muted" : "hover:bg-muted/50",
													isSelected && "border-primary bg-primary/5",
												)}
											>
												<Checkbox
													id={`card-away-${card.id}`}
													disabled={isUsedByThisTeam}
													checked={isSelected}
													onCheckedChange={(checked) => {
														if (checked) {
															setSelectedAwayCardIds([...selectedAwayCardIds, card.id]);
														} else {
															setSelectedAwayCardIds(
																selectedAwayCardIds.filter((id) => id !== card.id),
															);
														}
													}}
												/>
												<div className="grid gap-1.5 leading-none">
													<label
														htmlFor={`card-away-${card.id}`}
														className="text-xs font-medium leading-none cursor-pointer"
													>
														{card.name}
													</label>
													<p className="text-[10px] text-muted-foreground line-clamp-1">
														{card.description}
													</p>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<Button
						loading={mutation.isPending}
						onClick={() => {
							if (!match) return;

							const usedCards = [
								...selectedHomeCardIds.map((id) => ({
									cardDefinitionId: id,
									teamId: match.homeTeamId,
								})),
								...selectedAwayCardIds.map((id) => ({
									cardDefinitionId: id,
									teamId: match.awayTeamId,
								})),
							];

							mutation.mutate({
								matchId: match.id,
								rowVersion: match.rowVersion,
								scoreHome,
								scoreAway,
								tableId: tableId ? parseInt(tableId, 10) : null,
								usedCards,
							});
						}}
					>
						Conferma Risultato
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
