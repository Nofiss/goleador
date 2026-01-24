import { ArrowRightLeft, CalendarClock, MapPin, Search } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchResultDialog } from "@/features/matches/MatchResultDialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { type TournamentDetail, type TournamentMatch, TournamentStatus } from "@/types";

interface Props {
	tournament: TournamentDetail;
}

export const MatchesTabSkeleton = () => (
	<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
		{Array.from({ length: 6 }).map((_, i) => (
			<div
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
				key={i}
				className="h-32 rounded-xl border bg-card p-5 flex flex-col justify-between"
			>
				<div className="flex justify-between items-start">
					<Skeleton className="h-4 w-20 rounded-full" />
					<Skeleton className="h-3 w-24" />
				</div>
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-6 w-8 rounded" />
					</div>
					<div className="flex justify-between items-center">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-6 w-8 rounded" />
					</div>
				</div>
			</div>
		))}
	</div>
);

/**
 * Componente per la card della partita, ottimizzato con React.memo.
 * Previene re-render quando cambia lo stato del genitore ma i dati della partita sono invariati.
 */
const MatchCard = memo(
	({
		match,
		isReferee,
		onSelectMatch,
	}: {
		match: TournamentMatch;
		isReferee: boolean;
		onSelectMatch: (match: TournamentMatch) => void;
	}) => (
		<div
			className={cn(
				"group relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all",
				"hover:shadow-md hover:-translate-y-0.5",
				match.status === 1 ? "bg-muted/30" : "border-primary/20",
			)}
		>
			{/* Status Bar laterale */}
			<div
				className={cn(
					"absolute left-0 top-0 bottom-0 w-1 transition-colors",
					match.status === 1 ? "bg-muted-foreground/30" : "bg-primary",
				)}
			/>

			<div className="pl-5 p-5">
				{/* Header Card */}
				<div
					className={cn("flex justify-between items-start", match.status === 1 ? "mb-3" : "mb-4")}
				>
					<span
						className={cn(
							"text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
							match.status === 0
								? "text-primary border-primary/20 bg-primary/5"
								: "text-muted-foreground border-muted-foreground/20 bg-muted",
						)}
					>
						{match.status === 0 ? "Da Giocare" : "Terminata"}
					</span>

					<div className="flex flex-col items-end gap-1">
						{match.status === 1 && match.datePlayed && (
							<span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
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
							<span className="flex items-center gap-1 text-xs font-medium bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded border border-border/50">
								<MapPin className="h-3 w-3" /> {match.tableName}
							</span>
						)}
					</div>
				</div>

				{/* Squadre e Punteggio */}
				<div className={cn(match.status === 1 ? "space-y-2" : "space-y-3")}>
					<div className="flex justify-between items-center group/team">
						<span
							className={cn(
								"text-base font-semibold transition-colors truncate",
								match.status === 1 && match.scoreHome > match.scoreAway
									? "text-foreground"
									: "text-muted-foreground",
							)}
						>
							{match.homeTeamName}
						</span>
						<span
							className={cn(
								"font-mono text-xl tabular-nums min-w-8 text-center rounded bg-muted/50 px-2",
								match.status === 1 && match.scoreHome > match.scoreAway && "text-primary font-bold",
							)}
						>
							{match.status === 1 ? match.scoreHome : "-"}
						</span>
					</div>

					<div className="flex justify-between items-center group/team">
						<span
							className={cn(
								"text-base font-semibold transition-colors truncate",
								match.status === 1 && match.scoreAway > match.scoreHome
									? "text-foreground"
									: "text-muted-foreground",
							)}
						>
							{match.awayTeamName}
						</span>
						<span
							className={cn(
								"font-mono text-xl tabular-nums min-w-8 text-center rounded bg-muted/50 px-2",
								match.status === 1 && match.scoreAway > match.scoreHome && "text-primary font-bold",
							)}
						>
							{match.status === 1 ? match.scoreAway : "-"}
						</span>
					</div>
				</div>

				{/* Azione (Solo Referee) */}
				<div
					className={cn(
						"mt-4 pt-3 border-t min-h-9",
						isReferee ? "border-border/50" : "border-transparent",
					)}
				>
					{isReferee && (
						<Button
							variant={match.status === 0 ? "default" : "secondary"}
							size="sm"
							className="w-full h-8 text-xs font-semibold"
							onClick={() => onSelectMatch(match)}
						>
							{match.status === 0 ? "Inserisci Risultato" : "Modifica Risultato"}
						</Button>
					)}
				</div>
			</div>
		</div>
	),
);

MatchCard.displayName = "MatchCard";

/**
 * Componente per la griglia delle partite, ottimizzato con React.memo.
 */
const MatchGrid = memo(
	({
		matches,
		title,
		isReferee,
		onSelectMatch,
	}: {
		matches: TournamentMatch[];
		title: string;
		isReferee: boolean;
		onSelectMatch: (match: TournamentMatch) => void;
	}) => {
		return (
			<div className="mb-12">
				<h3 className="text-lg font-semibold mt-8 mb-4 flex items-center gap-2 text-foreground/90">
					{title === "Girone di Ritorno" ? (
						<ArrowRightLeft className="w-5 h-5 text-orange-500 dark:text-orange-400" />
					) : (
						<MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
					)}
					{title}
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
					{matches.map((match) => (
						<MatchCard
							key={match.id}
							match={match}
							isReferee={isReferee}
							onSelectMatch={onSelectMatch}
						/>
					))}
				</div>
			</div>
		);
	},
);

MatchGrid.displayName = "MatchGrid";

export const MatchesTab = ({ tournament }: Props) => {
	const { isReferee } = useAuth();
	const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");

	// Ottimizzazione: useMemo per evitare ricalcoli costosi su ogni render
	// Spostato prima dell'early return per seguire le regole degli Hooks
	const filteredMatches = useMemo(() => {
		return tournament.matches.filter((match) => {
			const matchesSearch =
				match.homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				match.awayTeamName.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesStatus =
				statusFilter === "ALL" ||
				(statusFilter === "TO_PLAY" && match.status === 0) ||
				(statusFilter === "FINISHED" && match.status === 1);

			return matchesSearch && matchesStatus;
		});
	}, [tournament.matches, searchQuery, statusFilter]);

	const { firstLegMatches, secondLegMatches } = useMemo(() => {
		const sorted = [...filteredMatches].sort((a, b) => a.round - b.round);
		const allMatchesSorted = [...tournament.matches].sort((a, b) => a.round - b.round);
		const max = Math.max(...allMatchesSorted.map((m) => m.round), 0);
		const roundsInFirstLeg = tournament.hasReturnMatches ? max / 2 : max;

		return {
			firstLegMatches: sorted.filter((m) => m.round <= roundsInFirstLeg),
			secondLegMatches: sorted.filter((m) => m.round > roundsInFirstLeg),
		};
	}, [filteredMatches, tournament.matches, tournament.hasReturnMatches]);

	if (tournament.status === TournamentStatus.setup) {
		return (
			<div className="text-center py-12 bg-muted/20 border border-dashed border-border rounded-xl text-muted-foreground">
				<CalendarClock className="w-10 h-10 mx-auto mb-3 opacity-20" />
				<p>Il calendario verrà generato all'avvio del torneo.</p>
			</div>
		);
	}

	return (
		<div className="animate-in fade-in duration-500">
			{/* Toolbar di Filtraggio */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						placeholder="Cerca squadra..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-full sm:w-[180px]">
						<SelectValue placeholder="Stato partita" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">Tutte le partite</SelectItem>
						<SelectItem value="TO_PLAY">Da Giocare</SelectItem>
						<SelectItem value="FINISHED">Terminate</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{filteredMatches.length === 0 ? (
				<div className="text-center py-20 bg-muted/10 border border-dashed border-border rounded-xl animate-in fade-in zoom-in duration-300">
					<Search className="w-10 h-10 mx-auto mb-3 opacity-20 text-muted-foreground" />
					<p className="text-muted-foreground font-medium">
						Nessuna partita trovata con questi filtri.
					</p>
					<Button
						variant="link"
						onClick={() => {
							setSearchQuery("");
							setStatusFilter("ALL");
						}}
						className="mt-2 text-primary"
					>
						Resetta filtri
					</Button>
				</div>
			) : secondLegMatches.length > 0 ? (
				<>
					<MatchGrid
						matches={firstLegMatches}
						title="Girone di Andata"
						isReferee={isReferee}
						onSelectMatch={setSelectedMatch}
					/>
					<MatchGrid
						matches={secondLegMatches}
						title="Girone di Ritorno"
						isReferee={isReferee}
						onSelectMatch={setSelectedMatch}
					/>
				</>
			) : (
				<MatchGrid
					matches={firstLegMatches}
					title="Calendario Partite"
					isReferee={isReferee}
					onSelectMatch={setSelectedMatch}
				/>
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
