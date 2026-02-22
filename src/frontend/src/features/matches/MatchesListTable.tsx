import { useQuery } from "@tanstack/react-query";
import { History, Zap } from "lucide-react";
import { memo } from "react";
import { getRecentMatches } from "@/api/matches";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
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
			<TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
				<div className="flex items-center justify-end gap-1">
					{match.hasCardsHome && (
						<span title="Carte giocate" className="flex items-center">
							<Zap className="h-3 w-3 text-yellow-500" aria-hidden="true" />
							<span className="sr-only">Carte giocate</span>
						</span>
					)}
					{match.homeTeamName || "Player A"}
					{match.scoreHome > match.scoreAway && (
						<Badge
							variant="default"
							className="ml-2 text-[10px] h-4 px-1"
							title="Vincitore"
							aria-label="Vincitore"
						>
							W
						</Badge>
					)}
				</div>
			</TableCell>
			<TableCell className="text-center font-mono font-bold text-lg bg-gray-50/50 dark:bg-white/5">
				{match.scoreHome} - {match.scoreAway}
			</TableCell>
			<TableCell className="text-left font-medium text-red-600 dark:text-red-400">
				<div className="flex items-center justify-start gap-1">
					{match.scoreAway > match.scoreHome && (
						<Badge
							variant="default"
							className="mr-2 text-[10px] h-4 px-1"
							title="Vincitore"
							aria-label="Vincitore"
						>
							W
						</Badge>
					)}
					{match.awayTeamName || "Player B"}
					{match.hasCardsAway && (
						<span title="Carte giocate" className="flex items-center">
							<Zap className="h-3 w-3 text-yellow-500" aria-hidden="true" />
							<span className="sr-only">Carte giocate</span>
						</span>
					)}
				</div>
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
			<CardContent className={cn("p-0", matches?.length === 0 && "p-6")}>
				{matches?.length === 0 ? (
					<EmptyState
						icon={History}
						title="Nessuna partita registrata"
						description="Le sfide amichevoli e i risultati dei tornei appariranno qui."
						className="py-12"
					/>
				) : (
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
							{matches?.map((match) => (
								<MatchRow key={match.id} match={match} />
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
};
