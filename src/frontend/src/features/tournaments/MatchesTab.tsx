import {
	ArrowRightLeft,
	CalendarClock,
	LayoutGrid,
	List,
	MapPin,
	Search,
	Zap,
} from "lucide-react";
import { memo, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchResultDialog } from "@/features/matches/MatchResultDialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { type TournamentDetail, type TournamentMatch, TournamentStatus } from "@/types";
import { BulkAssignTableDialog } from "./actions/BulkAssignTableDialog";
import { MatchesCrossTable } from "./detail/MatchesCrossTable";

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
 * Badge di stato per la partita (Da Giocare / Terminata).
 * Riduce la complessità cognitiva di MatchCard (typescript:S3776).
 */
const MatchStatusBadge = memo(({ status }: { status: number }) => (
	<span
		className={cn(
			"text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
			status === 0
				? "text-primary border-primary/20 bg-primary/5"
				: "text-muted-foreground border-muted-foreground/20 bg-muted",
		)}
	>
		{status === 0 ? "Da Giocare" : "Terminata"}
	</span>
));
MatchStatusBadge.displayName = "MatchStatusBadge";

/**
 * Riga della squadra con relativo punteggio e evidenziazione vincitore.
 * Riduce la complessità cognitiva di MatchCard (typescript:S3776).
 */
const TeamScoreRow = memo(
	({
		teamName,
		score,
		isPlayed,
		isWinner,
		hasCards = false,
	}: {
		teamName: string;
		score: number;
		isPlayed: boolean;
		isWinner: boolean;
		hasCards?: boolean;
	}) => (
		<div className="flex justify-between items-center group/team">
			<div className="flex items-center gap-2 truncate">
				<span
					className={cn(
						"text-base font-semibold transition-colors truncate",
						isWinner ? "text-foreground" : "text-muted-foreground",
					)}
				>
					{teamName}
				</span>
				{hasCards && (
					<Zap className="h-3 w-3 text-yellow-500 animate-pulse" aria-label="Carta Giocata" />
				)}
			</div>
			<span
				className={cn(
					"font-mono text-xl tabular-nums min-w-8 text-center rounded bg-muted/50 px-2",
					isWinner && "text-primary font-bold",
				)}
			>
				{isPlayed ? score : "-"}
			</span>
		</div>
	),
);
TeamScoreRow.displayName = "TeamScoreRow";

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
	}) => {
		const isPlayed = match.status === 1;
		const isToPlay = match.status === 0;
		const homeWon = isPlayed && match.scoreHome > match.scoreAway;
		const awayWon = isPlayed && match.scoreAway > match.scoreHome;

		return (
			<div
				className={cn(
					"group relative overflow-hidden rounded-xl border border-border/40 bg-card shadow-sm transition-all",
					"hover:shadow-md hover:-translate-y-0.5",
					isPlayed ? "bg-muted/30" : "border-primary/20",
				)}
			>
				{/* Status Bar laterale */}
				<div
					className={cn(
						"absolute left-0 top-0 bottom-0 w-1 transition-colors",
						isPlayed ? "bg-muted-foreground/30" : "bg-primary",
					)}
				/>

				<div className="pl-5 p-5">
					{/* Header Card */}
					<div className={cn("flex justify-between items-start", isPlayed ? "mb-3" : "mb-4")}>
						<MatchStatusBadge status={match.status} />

						<div className="flex flex-col items-end gap-1">
							{isPlayed && match.datePlayed && (
								<span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
									<CalendarClock className="h-3 w-3" aria-hidden="true" />
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
									<MapPin className="h-3 w-3" aria-hidden="true" /> {match.tableName}
								</span>
							)}
						</div>
					</div>

					{/* Squadre e Punteggio */}
					<div className={cn(isPlayed ? "space-y-2" : "space-y-3")}>
						<TeamScoreRow
							teamName={match.homeTeamName}
							score={match.scoreHome}
							isPlayed={isPlayed}
							isWinner={homeWon}
							hasCards={(match.cardUsages || []).some((cu) => cu.teamId === match.homeTeamId)}
						/>
						<TeamScoreRow
							teamName={match.awayTeamName}
							score={match.scoreAway}
							isPlayed={isPlayed}
							isWinner={awayWon}
							hasCards={(match.cardUsages || []).some((cu) => cu.teamId === match.awayTeamId)}
						/>
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
								variant={isToPlay ? "default" : "secondary"}
								size="sm"
								className="w-full h-8 text-xs font-semibold"
								onClick={() => onSelectMatch(match)}
							>
								{isToPlay ? "Inserisci Risultato" : "Modifica Risultato"}
							</Button>
						)}
					</div>
				</div>
			</div>
		);
	},
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
						<ArrowRightLeft
							className="w-5 h-5 text-orange-500 dark:text-orange-400"
							aria-hidden="true"
						/>
					) : (
						<MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
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
	const { isReferee, isAdmin } = useAuth();
	const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
	const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState("ALL");
	const [viewMode, setViewMode] = useState<"list" | "matrix">("list");

	// Ottimizzazione Bolt ⚡: useMemo per evitare ricalcoli costosi su ogni render
	// Ridotto l'overhead di toLowerCase() spostandolo fuori dal loop di filter
	const filteredMatches = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		return tournament.matches.filter((match) => {
			const matchesSearch =
				!query ||
				match.homeTeamName.toLowerCase().includes(query) ||
				match.awayTeamName.toLowerCase().includes(query);

			const matchesStatus =
				statusFilter === "ALL" ||
				(statusFilter === "TO_PLAY" && match.status === 0) ||
				(statusFilter === "FINISHED" && match.status === 1);

			return matchesSearch && matchesStatus;
		});
	}, [tournament.matches, searchQuery, statusFilter]);

	// Ottimizzazione Bolt ⚡: Calcolo del round di split in O(N) invece di O(N log N)
	// Evitiamo lo spread operator in Math.max per prevenire stack overflow su tornei giganti
	const roundsInFirstLeg = useMemo(() => {
		const maxRound = tournament.matches.reduce((max, m) => (m.round > max ? m.round : max), 0);
		return tournament.hasReturnMatches ? maxRound / 2 : maxRound;
	}, [tournament.matches, tournament.hasReturnMatches]);

	// Ottimizzazione Bolt ⚡: Split delle leg in un singolo passaggio invece di due filter()
	const { firstLegMatches, secondLegMatches } = useMemo(() => {
		const sorted = [...filteredMatches].sort((a, b) => a.round - b.round);
		const first: TournamentMatch[] = [];
		const second: TournamentMatch[] = [];

		for (const m of sorted) {
			if (m.round <= roundsInFirstLeg) {
				first.push(m);
			} else {
				second.push(m);
			}
		}

		return {
			firstLegMatches: first,
			secondLegMatches: second,
		};
	}, [filteredMatches, roundsInFirstLeg]);

	if (tournament.status === TournamentStatus.setup) {
		return (
			<EmptyState
				icon={CalendarClock}
				title="Calendario non ancora generato"
				description="Il calendario delle partite verrà creato automaticamente non appena l'amministratore avvierà il torneo."
			/>
		);
	}

	return (
		<div className="animate-in fade-in duration-500">
			{/* Toolbar di Filtraggio e Switcher Vista */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-muted/30 p-4 rounded-xl border border-border/50">
				<div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
					<div className="relative flex-1 sm:max-w-xs">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							placeholder="Cerca squadra..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="pl-9 bg-background"
						/>
					</div>
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-full sm:w-[180px] bg-background">
							<SelectValue placeholder="Stato partita" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="ALL">Tutte le partite</SelectItem>
							<SelectItem value="TO_PLAY">Da Giocare</SelectItem>
							<SelectItem value="FINISHED">Terminate</SelectItem>
						</SelectContent>
					</Select>
					{isAdmin && (
						<Button
							variant="outline"
							className="bg-background border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
							onClick={() => setIsBulkAssignOpen(true)}
						>
							<MapPin className="mr-2 h-4 w-4" aria-hidden="true" /> Assegna Tavoli
						</Button>
					)}
				</div>

				<Tabs
					value={viewMode}
					onValueChange={(v) => setViewMode(v as "list" | "matrix")}
					className="w-full sm:w-auto"
				>
					<TabsList className="grid w-full grid-cols-2 sm:w-[200px]">
						<TabsTrigger value="list" className="flex items-center gap-2">
							<List className="h-4 w-4" aria-hidden="true" />
							Lista
						</TabsTrigger>
						<TabsTrigger value="matrix" className="flex items-center gap-2">
							<LayoutGrid className="h-4 w-4" aria-hidden="true" />
							Matrice
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{filteredMatches.length === 0 ? (
				<EmptyState
					icon={Search}
					title="Nessuna partita trovata"
					description="Nessuna partita corrisponde ai criteri di ricerca impostati."
					className="py-20"
					action={
						<Button
							variant="outline"
							onClick={() => {
								setSearchQuery("");
								setStatusFilter("ALL");
							}}
						>
							Resetta filtri
						</Button>
					}
				/>
			) : viewMode === "matrix" ? (
				<MatchesCrossTable
					teams={tournament.teams}
					matches={filteredMatches}
					isReferee={isReferee}
					onSelectMatch={setSelectedMatch}
				/>
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
				cardDefinitions={tournament.cardDefinitions}
				allMatches={tournament.matches}
			/>

			<BulkAssignTableDialog
				tournamentId={tournament.id}
				isOpen={isBulkAssignOpen}
				onOpenChange={setIsBulkAssignOpen}
				hasReturnMatches={tournament.hasReturnMatches}
			/>
		</div>
	);
};
