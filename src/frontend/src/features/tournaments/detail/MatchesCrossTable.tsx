import { MapPin } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { TournamentMatch, TournamentTeam } from "@/types";

interface Props {
	teams: TournamentTeam[];
	matches: TournamentMatch[];
	isReferee?: boolean;
	onSelectMatch?: (match: TournamentMatch) => void;
}

/**
 * Visualizzazione a Matrice (Cross-Table) per i match del torneo.
 * Ideale per Round Robin (Girone all'italiana).
 */
export const MatchesCrossTable = memo(({ teams, matches, isReferee, onSelectMatch }: Props) => {
	const [filterMode, setFilterMode] = useState<"ALL" | "LEG1" | "LEG2">("ALL");

	// Calcolo dinamico del punto di taglio tra andata e ritorno
	const splitRound = useMemo(() => {
		if (matches.length === 0) return 0;
		const maxRound = Math.max(...matches.map((m) => m.round));
		return Math.ceil(maxRound / 2);
	}, [matches]);

	// Ottimizzazione Bolt ⚡: Lookup O(1) invece di O(N) dentro il doppio ciclo di render.
	// Mappa delle partite con chiave composta: "HomeTeamId_AwayTeamId"
	const matchesMap = useMemo(() => {
		const map = new Map<string, TournamentMatch>();
		for (const match of matches) {
			map.set(`${match.homeTeamId}_${match.awayTeamId}`, match);
		}
		return map;
	}, [matches]);

	return (
		<div className="space-y-4">
			{/* Filtro Fase (Andata/Ritorno) */}
			<div className="flex justify-start">
				<Tabs
					value={filterMode}
					onValueChange={(v) => setFilterMode(v as "ALL" | "LEG1" | "LEG2")}
					className="w-full sm:w-auto"
				>
					<TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
						<TabsTrigger value="ALL">Tutte</TabsTrigger>
						<TabsTrigger value="LEG1">Girone di Andata</TabsTrigger>
						<TabsTrigger value="LEG2">Girone di Ritorno</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			<div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden animate-in fade-in duration-500">
				<div className="overflow-x-auto max-w-full">
					<table className="w-full border-collapse text-sm">
						<thead>
							<tr>
								{/* Cella Angolo (Sticky sia orizzontale che verticale) */}
								<th className="sticky left-0 top-0 z-30 bg-muted/95 backdrop-blur-sm border-b border-r p-4 min-w-[160px] text-left font-bold text-muted-foreground uppercase tracking-wider shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
									<div className="flex flex-col">
										<span className="text-[10px] self-end opacity-70">OSPITI</span>
										<span className="text-[10px] self-start opacity-70">CASA</span>
									</div>
								</th>
								{teams.map((team) => (
									<th
										key={team.id}
										className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b border-r p-4 min-w-[120px] text-center font-bold text-muted-foreground uppercase tracking-tight whitespace-nowrap"
									>
										{team.name}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{teams.map((homeTeam) => (
								<tr key={homeTeam.id} className="group hover:bg-muted/5 transition-colors">
									{/* Header Verticale (Sticky) */}
									<th className="sticky left-0 z-20 bg-muted/80 backdrop-blur-sm border-b border-r p-4 text-left font-bold text-foreground group-hover:bg-muted/95 transition-colors whitespace-nowrap shadow-[1px_0_0_0_rgba(0,0,0,0.1)]">
										{homeTeam.name}
									</th>
									{teams.map((awayTeam) => {
										const isDiagonal = homeTeam.id === awayTeam.id;
										const match = matchesMap.get(`${homeTeam.id}_${awayTeam.id}`);

										// Logica di filtraggio per fase
										const isMatchInSelectedPhase =
											!match ||
											filterMode === "ALL" ||
											(filterMode === "LEG1" && match.round <= splitRound) ||
											(filterMode === "LEG2" && match.round > splitRound);

										if (isDiagonal) {
											return (
												<td
													key={awayTeam.id}
													className="border-b border-r p-0 bg-slate-100 dark:bg-slate-900/40 relative overflow-hidden"
												>
													{/* Pattern a righe diagonali per indicare cella non valida */}
													<div
														className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
														style={{
															backgroundImage:
																"repeating-linear-gradient(45deg, #000, #000 10px, transparent 10px, transparent 20px)",
														}}
													/>
												</td>
											);
										}

										if (!match || !isMatchInSelectedPhase) {
											return (
												<td
													key={awayTeam.id}
													className={cn(
														"border-b border-r p-4 text-center italic transition-colors",
														!isMatchInSelectedPhase
															? "bg-muted/30 text-muted-foreground/10"
															: "text-muted-foreground/20",
													)}
												>
													-
												</td>
											);
										}

										const isPlayed = match.status === 1;

										return (
											<td
												key={awayTeam.id}
												role={isReferee ? "button" : undefined}
												tabIndex={isReferee ? 0 : undefined}
												className={cn(
													"border-b border-r p-2 text-center transition-all relative group/cell",
													isPlayed
														? "bg-green-500/5 dark:bg-green-500/10"
														: "bg-background hover:bg-muted/30",
													isReferee &&
														"cursor-pointer active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:z-10",
												)}
												onClick={() => isReferee && onSelectMatch?.(match)}
												onKeyDown={(e) => {
													if (isReferee && (e.key === "Enter" || e.key === " ")) {
														e.preventDefault();
														onSelectMatch?.(match);
													}
												}}
											>
												<div className="flex flex-col items-center justify-center min-h-[50px] gap-1">
													{isPlayed ? (
														<span className="text-lg font-black font-mono tracking-tighter text-foreground">
															{match.scoreHome} - {match.scoreAway}
														</span>
													) : (
														<span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter leading-tight">
															Da Giocare
														</span>
													)}

													{match.tableName && (
														<span className="flex items-center gap-0.5 text-[9px] font-bold text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-md border border-primary/10 transition-transform group-hover/cell:scale-110">
															<MapPin className="h-2.5 w-2.5" />
															{match.tableName}
														</span>
													)}
												</div>

												{isReferee && (
													<div className="absolute inset-0 border-2 border-primary/0 group-hover/cell:border-primary/20 transition-all pointer-events-none" />
												)}
											</td>
										);
									})}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
});

MatchesCrossTable.displayName = "MatchesCrossTable";
