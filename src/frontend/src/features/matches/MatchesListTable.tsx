import { useQuery } from "@tanstack/react-query";
import { getRecentMatches } from "@/api/matches";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { MatchDto } from "@/types";

export const MatchesListTable = () => {
	// const { data: matches, isLoading } = useQuery({
	// 	queryKey: ["matches"],
	// 	queryFn: getRecentMatches,
	// });

	const { data: matches, isLoading } = {
		data: [] as MatchDto[],
		isLoading: false,
	};

	if (isLoading)
		return <div className="text-center py-10">Caricamento partite...</div>;

	return (
		<Card>
			<CardContent className="p-0">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Data</TableHead>
							<TableHead className="text-right w-[40%]">Casa</TableHead>
							<TableHead className="text-center w-25">Risultato</TableHead>
							<TableHead className="text-left w-[40%]">Ospite</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{matches?.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={4}
									className="text-center h-24 text-muted-foreground"
								>
									Nessuna partita registrata.
								</TableCell>
							</TableRow>
						) : (
							matches?.map((match) => (
								<TableRow key={match.id}>
									<TableCell className="text-muted-foreground text-xs">
										{new Date(match.datePlayed).toLocaleDateString()}
									</TableCell>
									<TableCell className="text-right font-medium text-blue-700">
										{match.homeTeamName || "Player A"}
										{match.scoreHome > match.scoreAway && (
											<Badge variant="secondary" className="ml-2 text-[10px]">
												W
											</Badge>
										)}
									</TableCell>
									<TableCell className="text-center font-mono font-bold text-lg bg-gray-50/50">
										{match.scoreHome} - {match.scoreAway}
									</TableCell>
									<TableCell className="text-left font-medium text-red-700">
										{match.scoreAway > match.scoreHome && (
											<Badge variant="secondary" className="mr-2 text-[10px]">
												W
											</Badge>
										)}
										{match.awayTeamName || "Player B"}
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};
