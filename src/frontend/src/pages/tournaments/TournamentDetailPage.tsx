import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getTournamentById } from "@/api/tournaments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchesTab, MatchesTabSkeleton } from "@/features/tournaments/MatchesTab";
import { StandingsTable } from "@/features/tournaments/StandingsTable";
import { TeamsTab } from "@/features/tournaments/TeamsTab";
import {
	TournamentHeader,
	TournamentHeaderSkeleton,
} from "@/features/tournaments/TournamentHeader";
import { TournamentStatus } from "@/types";

export const TournamentDetailPage = () => {
	const { id } = useParams<{ id: string }>();

	const { data: tournament, isLoading } = useQuery({
		queryKey: ["tournament", id],
		queryFn: () => getTournamentById(id as string),
		enabled: !!id,
	});

	if (isLoading || !tournament) {
		return (
			<div className="container mx-auto max-w-7xl p-4 md:p-8 space-y-8 pb-20">
				<TournamentHeaderSkeleton />
				<Tabs defaultValue="matches" className="w-full">
					<TabsList className="grid w-full grid-cols-3 md:w-[400px]">
						<TabsTrigger value="teams" disabled>
							Squadre
						</TabsTrigger>
						<TabsTrigger value="matches">Partite</TabsTrigger>
						<TabsTrigger value="standings" disabled>
							Classifica
						</TabsTrigger>
					</TabsList>
					<div className="mt-6">
						<MatchesTabSkeleton />
					</div>
				</Tabs>
			</div>
		);
	}

	// Default tab logic
	const defaultTab = tournament.status === TournamentStatus.setup ? "teams" : "standings";

	return (
		<div className="container mx-auto max-w-7xl p-4 md:p-8 space-y-8 pb-20">
			{/* Componente Header estratto */}
			<TournamentHeader tournament={tournament} />

			<Tabs defaultValue={defaultTab} className="w-full">
				<TabsList className="grid w-full grid-cols-3 md:w-[400px]">
					<TabsTrigger value="teams">Squadre</TabsTrigger>
					<TabsTrigger value="matches">Partite</TabsTrigger>
					<TabsTrigger value="standings">Classifica</TabsTrigger>
				</TabsList>

				<div className="mt-6">
					<TabsContent value="teams">
						<TeamsTab tournament={tournament} />
					</TabsContent>

					<TabsContent value="matches">
						<MatchesTab tournament={tournament} />
					</TabsContent>

					<TabsContent value="standings">
						<StandingsTable tournamentId={tournament.id} status={tournament.status} />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
};
