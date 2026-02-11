import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { memo } from "react";
import { getRecentMatches } from "@/api/matches";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { MatchDto } from "@/types";

/**
 * Componente per la riga della partita, ottimizzato con React.memo.
 */
const MatchRow = memo(({ match }: { match: MatchDto }) => {
	return (
		<TableRow>
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
	);
});

MatchRow.displayName = "MatchRow";

export const MatchesListTable = () => {
	const { data: matches, isLoading } = useQuery({
		queryKey: ["recent-matches"],
		queryFn: getRecentMatches,
	});

	if (isLoading) {
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
							{Array.from({ length: 5 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
								<TableRow key={i}>
									<TableCell>
										<Skeleton className="h-4 w-16" />
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end gap-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-4 rounded-full" />
										</div>
									</TableCell>
									<TableCell>
										<Skeleton className="h-8 w-12 mx-auto" />
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											<Skeleton className="h-4 w-4 rounded-full" />
											<Skeleton className="h-4 w-24" />
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		);
	}

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
								<TableCell colSpan={4} className="h-64">
									<div className="flex flex-col items-center justify-center text-center space-y-3">
										<div className="bg-muted/50 rounded-full p-4">
											<History className="h-8 w-8 text-muted-foreground/40" />
										</div>
										<div className="space-y-1">
											<p className="font-semibold text-foreground">Nessuna partita registrata</p>
											<p className="text-sm text-muted-foreground max-w-[250px]">
												Le sfide amichevoli e i risultati dei tornei appariranno qui.
											</p>
										</div>
									</div>
								</TableCell>
							</TableRow>
						) : (
							matches?.map((match) => <MatchRow key={match.id} match={match} />)
						)}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
};
