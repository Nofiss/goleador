import { useState } from "react";
import { type TournamentDetail, TournamentStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { MatchResultDialog } from "@/features/matches/MatchResultDialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface Props {
	tournament: TournamentDetail;
}

export const MatchesTab = ({ tournament }: Props) => {
	const { isReferee } = useAuth();
	const [selectedMatch, setSelectedMatch] = useState<any>(null);

	if (tournament.status === TournamentStatus.Setup) {
		return (
			<div className="text-center py-12 bg-gray-50 border rounded-lg text-muted-foreground">
				Il calendario verrà generato all'avvio del torneo.
			</div>
		);
	}

	return (
		<>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{tournament.matches.map((match) => (
					<div
						key={match.id}
						className={cn(
							"border rounded-xl p-4 shadow-sm bg-white flex flex-col justify-between h-full relative overflow-hidden",
							match.status === 1
								? "border-gray-200"
								: "border-blue-200 ring-1 ring-blue-50",
						)}
					>
						{/* Status Indicator */}
						<div
							className={cn(
								"absolute top-0 left-0 w-1 h-full",
								match.status === 1 ? "bg-gray-300" : "bg-blue-500",
							)}
						/>

						<div className="pl-3 mb-4">
							<div className="flex justify-between items-center text-xs text-muted-foreground mb-3">
								<span>{match.status === 0 ? "DA GIOCARE" : "TERMINATA"}</span>
								{match.tableName && (
									<span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-700">
										<MapPin className="h-3 w-3" /> {match.tableName}
									</span>
								)}
							</div>

							{/* Teams & Score */}
							<div className="space-y-3">
								{/* Home */}
								<div className="flex justify-between items-center">
									<span
										className={cn(
											"font-semibold truncate",
											match.scoreHome > match.scoreAway && "text-black",
											match.scoreHome < match.scoreAway && "text-gray-500",
										)}
									>
										{match.homeTeamName}
									</span>
									<span className="font-mono text-lg font-bold w-8 text-center">
										{match.status === 1 ? match.scoreHome : "-"}
									</span>
								</div>

								{/* Away */}
								<div className="flex justify-between items-center">
									<span
										className={cn(
											"font-semibold truncate",
											match.scoreAway > match.scoreHome && "text-black",
											match.scoreAway < match.scoreHome && "text-gray-500",
										)}
									>
										{match.awayTeamName}
									</span>
									<span className="font-mono text-lg font-bold w-8 text-center">
										{match.status === 1 ? match.scoreAway : "-"}
									</span>
								</div>
							</div>
						</div>

						{/* Action */}
						{isReferee && (
							<div className="pl-3 pt-2 border-t mt-auto">
								<Button
									variant={match.status === 0 ? "default" : "ghost"}
									size="sm"
									className="w-full h-8 text-xs"
									onClick={() => setSelectedMatch(match)}
								>
									{match.status === 0 ? "Inserisci Risultato" : "Modifica"}
								</Button>
							</div>
						)}
					</div>
				))}
			</div>

			<MatchResultDialog
				match={selectedMatch}
				isOpen={!!selectedMatch}
				onClose={() => setSelectedMatch(null)}
				tournamentId={tournament.id}
			/>
		</>
	);
};
