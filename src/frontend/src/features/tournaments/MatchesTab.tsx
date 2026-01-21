import { ArrowRightLeft, CalendarClock, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchResultDialog } from "@/features/matches/MatchResultDialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { type TournamentDetail, type TournamentMatch, TournamentStatus } from "@/types";

interface Props {
	tournament: TournamentDetail;
}

export const MatchesTab = ({ tournament }: Props) => {
	const { isReferee } = useAuth();
	const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

	if (tournament.status === TournamentStatus.setup) {
		return (
			<div className="text-center py-12 bg-muted/20 border border-dashed border-border rounded-xl text-muted-foreground">
				<CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-20" />
				<p>Il calendario verrà generato all'avvio del torneo.</p>
			</div>
		);
	}

	const sortedMatches = [...tournament.matches].sort((a, b) => a.round - b.round);
	const maxRound = Math.max(...sortedMatches.map((m) => m.round), 0);
	const roundsInFirstLeg = tournament.hasReturnMatches ? maxRound / 2 : maxRound;

	const firstLegMatches = sortedMatches.filter((m) => m.round <= roundsInFirstLeg);
	const secondLegMatches = sortedMatches.filter((m) => m.round > roundsInFirstLeg);

	const renderMatchGrid = (matches: typeof tournament.matches, title: string) => (
		<div className="mb-10">
			<h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-foreground/90">
				{title === "Girone di Ritorno" ? (
					<ArrowRightLeft className="w-5 h-5 text-orange-500 dark:text-orange-400" />
				) : (
					<MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
				)}
				{title}
			</h3>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{matches.map((match) => (
					<div
						key={match.id}
						className={cn(
							"group relative overflow-hidden rounded-xl border transition-all duration-200",
							"bg-card hover:shadow-md hover:border-accent-foreground/20",
							match.status === 1
								? "opacity-90 bg-muted/30" // Partite terminate leggermente più opache
								: "border-primary/10 shadow-sm",
						)}
					>
						{/* Status Bar laterale */}
						<div
							className={cn(
								"absolute top-0 left-0 w-1 h-full transition-colors",
								match.status === 1 ? "bg-muted-foreground/30" : "bg-primary",
							)}
						/>

						<div className="p-4 pl-5">
							{/* Header Card */}
							<div className="flex justify-between items-start mb-4">
								<span
									className={cn(
										"text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
										match.status === 0
											? "text-primary border-primary/20 bg-primary/5"
											: "text-muted-foreground border-muted-foreground/20 bg-muted",
									)}
								>
									{match.status === 0 ? "Da Giocare" : "Terminata"}
								</span>

								<div className="flex flex-col items-end gap-1">
									{match.status === 1 && match.datePlayed && (
										<span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
											<CalendarClock className="h-3 w-3" />
											{new Date(match.datePlayed).toLocaleDateString("it-IT", {
												day: "2-digit",
												month: "short",
												hour: "2-digit",
												minute: "2-digit",
											})}
										</span>
									)}
									{match.tableName && (
										<span className="flex items-center gap-1 text-[10px] font-medium bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded border border-border/50">
											<MapPin className="h-3 w-3" /> {match.tableName}
										</span>
									)}
								</div>
							</div>

							{/* Squadre e Punteggio */}
							<div className="space-y-3">
								<div className="flex justify-between items-center group/team">
									<span
										className={cn(
											"text-sm transition-colors",
											match.status === 1 && match.scoreHome > match.scoreAway
												? "font-bold text-foreground"
												: "text-muted-foreground",
										)}
									>
										{match.homeTeamName}
									</span>
									<span
										className={cn(
											"font-mono text-lg tabular-nums min-w-6 text-center rounded bg-muted/50 px-1",
											match.status === 1 &&
												match.scoreHome > match.scoreAway &&
												"text-primary font-bold",
										)}
									>
										{match.status === 1 ? match.scoreHome : "-"}
									</span>
								</div>

								<div className="flex justify-between items-center group/team">
									<span
										className={cn(
											"text-sm transition-colors",
											match.status === 1 && match.scoreAway > match.scoreHome
												? "font-bold text-foreground"
												: "text-muted-foreground",
										)}
									>
										{match.awayTeamName}
									</span>
									<span
										className={cn(
											"font-mono text-lg tabular-nums min-w-6 text-center rounded bg-muted/50 px-1",
											match.status === 1 &&
												match.scoreAway > match.scoreHome &&
												"text-primary font-bold",
										)}
									>
										{match.status === 1 ? match.scoreAway : "-"}
									</span>
								</div>
							</div>

							{/* Azione (Solo Referee) */}
							{isReferee && (
								<div className="mt-4 pt-3 border-t border-border/50">
									<Button
										variant={match.status === 0 ? "default" : "secondary"}
										size="sm"
										className="w-full h-8 text-xs font-semibold"
										onClick={() => setSelectedMatch(match)}
									>
										{match.status === 0 ? "Inserisci Risultato" : "Modifica Risultato"}
									</Button>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);

	return (
		<div className="animate-in fade-in duration-500">
			{secondLegMatches.length > 0 ? (
				<>
					{renderMatchGrid(firstLegMatches, "Girone di Andata")}
					{renderMatchGrid(secondLegMatches, "Girone di Ritorno")}
				</>
			) : (
				renderMatchGrid(firstLegMatches, "Calendario Partite")
			)}

			<MatchResultDialog
				match={selectedMatch}
				isOpen={!!selectedMatch}
				onClose={() => setSelectedMatch(null)}
				tournamentId={tournament.id}
			/>
		</div>
	);
};
