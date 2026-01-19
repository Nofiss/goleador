import { ArrowRightLeft, CalendarClock, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchResultDialog } from "@/features/matches/MatchResultDialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
	type TournamentDetail,
	type TournamentMatch,
	TournamentStatus,
	TournamentType,
} from "@/types";

interface Props {
	tournament: TournamentDetail;
}

export const MatchesTab = ({ tournament }: Props) => {
	const { isReferee } = useAuth();
	const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

	if (tournament.status === TournamentStatus.setup) {
		return (
			<div className="text-center py-12 bg-muted/30 border border-dashed rounded-lg text-muted-foreground">
				Il calendario verrà generato all'avvio del torneo.
			</div>
		);
	}

	const teamCount = tournament.teams.length;
	const isRoundRobin = tournament.type === TournamentType.roundRobin;

	const matchesPerLeg = (teamCount * (teamCount - 1)) / 2;

	let firstLegMatches = tournament.matches;
	let secondLegMatches: typeof tournament.matches = [];

	if (
		isRoundRobin &&
		tournament.hasReturnMatches &&
		tournament.matches.length >= matchesPerLeg * 2
	) {
		firstLegMatches = tournament.matches.slice(0, matchesPerLeg);
		secondLegMatches = tournament.matches.slice(matchesPerLeg);
	}

	const renderMatchGrid = (matches: typeof tournament.matches, title: string) => (
		<div className="mb-8">
			<h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700">
				{title === "Ritorno" ? (
					<ArrowRightLeft className="w-5 h-5 text-orange-500" />
				) : (
					<MapPin className="w-5 h-5 text-blue-500" />
				)}
				{title}
			</h3>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{matches.map((match) => (
					<div
						key={match.id}
						className={cn(
							"border rounded-xl p-4 shadow-sm bg-white flex flex-col justify-between h-full relative overflow-hidden transition-all hover:shadow-md",
							match.status === 1
								? "border-gray-200 bg-gray-50/50"
								: "border-blue-200 ring-1 ring-blue-50 bg-white",
						)}
					>
						{/* Status Bar laterale */}
						<div
							className={cn(
								"absolute top-0 left-0 w-1 h-full",
								match.status === 1 ? "bg-gray-300" : "bg-blue-500",
							)}
						/>

						<div className="pl-3 mb-3">
							{/* Header Card */}
							<div className="flex justify-between items-start text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
								<span className="font-bold">{match.status === 0 ? "Da Giocare" : "Terminata"}</span>

								{match.status === 1 && match.datePlayed && (
									<span
										className="flex items-center gap-1 text-[10px] font-medium text-slate-500"
										title={new Date(match.datePlayed).toLocaleString()}
									>
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
									<span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 normal-case border">
										<MapPin className="h-3 w-3" /> {match.tableName}
									</span>
								)}
							</div>

							{/* Squadre e Punteggio */}
							<div className="space-y-2">
								{/* Casa */}
								<div className="flex justify-between items-center">
									<span
										className={cn(
											"font-medium truncate text-sm",
											match.status === 1 && match.scoreHome > match.scoreAway
												? "text-black font-bold"
												: "text-gray-600",
										)}
									>
										{match.homeTeamName}
									</span>
									<span
										className={cn(
											"font-mono text-base w-6 text-center",
											match.status === 1 &&
												match.scoreHome > match.scoreAway &&
												"font-bold text-black",
										)}
									>
										{match.status === 1 ? match.scoreHome : "-"}
									</span>
								</div>

								{/* Ospite */}
								<div className="flex justify-between items-center">
									<span
										className={cn(
											"font-medium truncate text-sm",
											match.status === 1 && match.scoreAway > match.scoreHome
												? "text-black font-bold"
												: "text-gray-600",
										)}
									>
										{match.awayTeamName}
									</span>
									<span
										className={cn(
											"font-mono text-base w-6 text-center",
											match.status === 1 &&
												match.scoreAway > match.scoreHome &&
												"font-bold text-black",
										)}
									>
										{match.status === 1 ? match.scoreAway : "-"}
									</span>
								</div>
							</div>
						</div>

						{/* Azione (Solo Referee) */}
						{isReferee && (
							<div className="pl-3 pt-2 border-t mt-auto">
								<Button
									variant={match.status === 0 ? "default" : "ghost"}
									size="sm"
									className={cn(
										"w-full h-7 text-xs",
										match.status === 0 ? "bg-blue-600 hover:bg-blue-700" : "text-muted-foreground",
									)}
									onClick={() => setSelectedMatch(match)}
								>
									{match.status === 0 ? "Inserisci Risultato" : "Modifica"}
								</Button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);

	return (
		<>
			{/* Se c'è ritorno, mostra due griglie, altrimenti una sola generica */}
			{secondLegMatches.length > 0 ? (
				<>
					{renderMatchGrid(firstLegMatches, "Girone di Andata")}
					{renderMatchGrid(secondLegMatches, "Girone di Ritorno")}
				</>
			) : (
				renderMatchGrid(firstLegMatches, "Partite")
			)}

			<MatchResultDialog
				match={selectedMatch}
				isOpen={!!selectedMatch}
				onClose={() => setSelectedMatch(null)}
				tournamentId={tournament.id}
			/>
		</>
	);
};
