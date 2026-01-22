
import { ArrowRightLeft, CalendarClock, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchResultDialog } from "@/features/matches/MatchResultDialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { type TournamentDetail, type TournamentMatch, TournamentStatus } from "@/types";

interface Props {
	tournament: TournamentDetail;
}

export const MatchesTabSkeleton = () => (
	<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{Array.from({ length: 6 }).map((_, i) => (
			<div
				key={i}
				className="h-32 rounded-xl border bg-card p-4 pl-5 flex flex-col justify-between"
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

const useNumColumns = () => {
	const [numColumns, setNumColumns] = useState(() => {
		if (typeof window === "undefined") return 1;
		if (window.innerWidth >= 1280) return 3;
		if (window.innerWidth >= 768) return 2;
		return 1;
	});

	useEffect(() => {
		const updateColumns = () => {
			if (window.innerWidth >= 1280) {
				setNumColumns(3);
			} else if (window.innerWidth >= 768) {
				setNumColumns(2);
			} else {
				setNumColumns(1);
			}
		};

		updateColumns();
		window.addEventListener("resize", updateColumns);
		return () => window.removeEventListener("resize", updateColumns);
	}, []);

	return numColumns;
};

const MatchCard = ({
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
			"group relative overflow-hidden rounded-lg border border-border/40 bg-card shadow-sm transition-all",
			"hover:shadow-md hover:-translate-y-0.5",
			match.status === 1 ? "bg-muted/30" : "border-primary/20",
		)}
	>
		{/* Status Bar laterale */}
		<div
			className={cn(
				"absolute top-0 left-0 w-0.5 sm:w-1 h-full transition-colors",
				match.status === 1 ? "bg-muted-foreground/30" : "bg-primary",
			)}
		/>

		<div className={cn("pl-5", match.status === 1 ? "p-3 sm:p-4" : "p-4 sm:p-5")}>
			{/* Header Card */}
			<div className={cn("flex justify-between items-start", match.status === 1 ? "mb-3" : "mb-4")}>
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
			<div className={cn(match.status === 1 ? "space-y-2" : "space-y-3")}>
				<div className="flex justify-between items-center group/team">
					<span
						className={cn(
							"text-sm transition-colors truncate",
							match.status === 1 && match.scoreHome > match.scoreAway
								? "font-bold text-foreground"
								: "text-muted-foreground",
						)}
					>
						{match.homeTeamName}
					</span>
					<span
						className={cn(
							"font-mono text-lg tabular-nums min-w-8 text-center rounded bg-muted/50 px-2",
							match.status === 1 && match.scoreHome > match.scoreAway && "text-primary font-bold",
						)}
					>
						{match.status === 1 ? match.scoreHome : "-"}
					</span>
				</div>

				<div className="flex justify-between items-center group/team">
					<span
						className={cn(
							"text-sm transition-colors truncate",
							match.status === 1 && match.scoreAway > match.scoreHome
								? "font-bold text-foreground"
								: "text-muted-foreground",
						)}
					>
						{match.awayTeamName}
					</span>
					<span
						className={cn(
							"font-mono text-lg tabular-nums min-w-8 text-center rounded bg-muted/50 px-2",
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
);

const MatchGrid = ({
	matches,
	title,
	numColumns,
	isReferee,
	onSelectMatch,
}: {
	matches: TournamentMatch[];
	title: string;
	numColumns: number;
	isReferee: boolean;
	onSelectMatch: (match: TournamentMatch) => void;
}) => {


	return (
		<div className="mb-12">
			<h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-foreground/90">
				{title === "Girone di Ritorno" ? (
					<ArrowRightLeft className="w-5 h-5 text-orange-500 dark:text-orange-400" />
				) : (
					<MapPin className="w-5 h-5 text-blue-500 dark:text-blue-400" />
				)}
				{title}
			</h3>

			<div
				className={cn(
					"grid gap-6 sm:gap-7",
					numColumns === 1 && "grid-cols-1",
					numColumns === 2 && "grid-cols-2",
					numColumns === 3 && "grid-cols-3",
				)}
			>
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
};

export const MatchesTab = ({ tournament }: Props) => {
	const { isReferee } = useAuth();
	const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
	const numColumns = useNumColumns();

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

	return (
		<div className="animate-in fade-in duration-500">
			{secondLegMatches.length > 0 ? (
				<>
					<MatchGrid
						matches={firstLegMatches}
						title="Girone di Andata"
						numColumns={numColumns}
						isReferee={isReferee}
						onSelectMatch={setSelectedMatch}
					/>
					<MatchGrid
						matches={secondLegMatches}
						title="Girone di Ritorno"
						numColumns={numColumns}
						isReferee={isReferee}
						onSelectMatch={setSelectedMatch}
					/>
				</>
			) : (
				<MatchGrid
					matches={firstLegMatches}
					title="Calendario Partite"
					numColumns={numColumns}
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
