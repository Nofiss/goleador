import { useQuery } from "@tanstack/react-query";
import { memo, useMemo, useState } from "react";
import { getTournamentStandings } from "@/api/tournaments";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { type TournamentStanding, TournamentStatus } from "@/types";

interface StandingsTableProps {
	tournamentId: string;
	status: TournamentStatus;
}

/**
 * Componente per la riga della classifica, ottimizzato con React.memo.
 */
const StandingRow = memo(
	({
		row,
		index,
		highlightProjection,
	}: {
		row: TournamentStanding;
		index: number;
		highlightProjection: boolean;
	}) => {
		return (
			<TableRow className={cn(index === 0 && "bg-yellow-500/5 dark:bg-yellow-500/10")}>
				<TableCell className="font-medium">
					<div
						className={cn(
							"w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
							index === 0
								? "bg-yellow-400 text-yellow-950"
								: index === 1
									? "bg-slate-300 text-slate-900"
									: index === 2
										? "bg-amber-600 text-white"
										: "bg-muted text-muted-foreground",
						)}
					>
						{row.position}
					</div>
				</TableCell>
				<TableCell className="font-semibold text-foreground">{row.teamName}</TableCell>
				<TableCell className="text-center font-bold text-lg text-primary">{row.points}</TableCell>
				<TableCell className="text-center text-muted-foreground">{row.played}</TableCell>
				<TableCell className="text-center hidden md:table-cell text-green-600 dark:text-green-500">
					{row.won}
				</TableCell>
				<TableCell className="text-center hidden md:table-cell text-muted-foreground/70">
					{row.drawn}
				</TableCell>
				<TableCell className="text-center hidden md:table-cell text-red-500 dark:text-red-400">
					{row.lost}
				</TableCell>
				<TableCell className="text-center hidden sm:table-cell text-muted-foreground">
					{row.goalsFor}
				</TableCell>
				<TableCell className="text-center hidden sm:table-cell text-muted-foreground">
					{row.goalsAgainst}
				</TableCell>
				<TableCell className="text-center font-mono text-sm">
					{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
				</TableCell>
				<TableCell
					className={cn(
						"text-center font-semibold italic",
						highlightProjection
							? "text-purple-600 dark:text-purple-400 bg-purple-500/5"
							: "text-muted-foreground/50",
					)}
				>
					{row.projectedPoints}
				</TableCell>
			</TableRow>
		);
	},
);

StandingRow.displayName = "StandingRow";

export const StandingsTable = ({ tournamentId, status }: StandingsTableProps) => {
	const [showProjection, setShowProjection] = useState(false);

	const { data: standings, isLoading } = useQuery<TournamentStanding[]>({
		queryKey: ["standings", tournamentId],
		queryFn: () => getTournamentStandings(tournamentId),
		enabled: status !== TournamentStatus.setup,
	});

	const sortedStandings = useMemo(() => {
		if (!standings) return [];
		const data = [...standings];
		if (showProjection) {
			return data.sort((a, b) => {
				if (b.projectedPoints !== a.projectedPoints) {
					return b.projectedPoints - a.projectedPoints;
				}
				// Pareggio: punti reali
				if (b.points !== a.points) {
					return b.points - a.points;
				}
				// Pareggio: differenza reti
				return b.goalDifference - a.goalDifference;
			});
		}
		return data;
	}, [standings, showProjection]);

	if (status === TournamentStatus.setup) {
		return (
			<div className="text-center py-10 text-muted-foreground border rounded bg-gray-50">
				Classifica disponibile all'avvio.
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="border rounded-md bg-card">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-12.5">Pos</TableHead>
							<TableHead>Squadra</TableHead>
							<TableHead className="text-center font-bold">PT</TableHead>
							<TableHead className="text-center text-muted-foreground">G</TableHead>
							<TableHead className="text-center hidden md:table-cell">V</TableHead>
							<TableHead className="text-center hidden md:table-cell">N</TableHead>
							<TableHead className="text-center hidden md:table-cell">P</TableHead>
							<TableHead className="text-center hidden sm:table-cell">GF</TableHead>
							<TableHead className="text-center hidden sm:table-cell">GS</TableHead>
							<TableHead className="text-center">DR</TableHead>
							<TableHead className="text-center text-purple-600 dark:text-purple-400">
								Proj
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: 8 }).map((_, i) => (
							<TableRow
								// biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
								key={i}
							>
								<TableCell>
									<Skeleton className="h-6 w-6 rounded-full" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-32" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-6 mx-auto" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-6 mx-auto" />
								</TableCell>
								<TableCell className="hidden md:table-cell">
									<Skeleton className="h-4 w-6 mx-auto" />
								</TableCell>
								<TableCell className="hidden md:table-cell">
									<Skeleton className="h-4 w-6 mx-auto" />
								</TableCell>
								<TableCell className="hidden md:table-cell">
									<Skeleton className="h-4 w-6 mx-auto" />
								</TableCell>
								<TableCell className="hidden sm:table-cell">
									<Skeleton className="h-4 w-6 mx-auto" />
								</TableCell>
								<TableCell className="hidden sm:table-cell">
									<Skeleton className="h-4 w-6 mx-auto" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-8 mx-auto" />
								</TableCell>
								<TableCell>
									<Skeleton className="h-4 w-6 mx-auto" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-end gap-2 px-1">
				<Label htmlFor="projection-mode" className="text-sm text-muted-foreground cursor-pointer">
					Mostra Proiezione Finale
				</Label>
				<Switch id="projection-mode" checked={showProjection} onCheckedChange={setShowProjection} />
			</div>

			<div className="border rounded-md bg-card">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/50">
							<TableHead className="w-12.5">Pos</TableHead>
							<TableHead>Squadra</TableHead>
							<TableHead className="text-center font-bold">PT</TableHead>
							<TableHead className="text-center text-muted-foreground">G</TableHead>
							<TableHead className="text-center hidden md:table-cell">V</TableHead>
							<TableHead className="text-center hidden md:table-cell">N</TableHead>
							<TableHead className="text-center hidden md:table-cell">P</TableHead>
							<TableHead className="text-center hidden sm:table-cell">GF</TableHead>
							<TableHead className="text-center hidden sm:table-cell">GS</TableHead>
							<TableHead className="text-center">DR</TableHead>
							<TableHead
								className={cn(
									"text-center cursor-help",
									showProjection && "text-purple-600 dark:text-purple-400 font-bold",
								)}
								title="Basato sulla media punti attuale"
							>
								Proj
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedStandings.length === 0 ? (
							<TableRow>
								<TableCell colSpan={11} className="text-center h-24 text-muted-foreground">
									Nessuna partita giocata
								</TableCell>
							</TableRow>
						) : (
							sortedStandings.map((row, index) => (
								<StandingRow
									key={row.teamId}
									row={row}
									index={index}
									highlightProjection={showProjection}
								/>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
