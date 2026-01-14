import { type TournamentDetail, TournamentStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { JoinTournamentButton } from "../JoinTournamentButton";
import { GenerateTeamsButton } from "../GenerateTeamsButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { startTournament } from "@/api/tournaments";

interface Props {
	tournament: TournamentDetail;
}

export const TournamentHeader = ({ tournament }: Props) => {
	const { isAdmin, isAuthenticated } = useAuth();
	const queryClient = useQueryClient();

	const startMutation = useMutation({
		mutationFn: startTournament,
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: ["tournament", tournament.id],
			}),
	});

	return (
		<div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b pb-6">
			<div>
				<div className="flex items-center gap-3 mb-2">
					<h1 className="text-3xl font-bold">{tournament.name}</h1>
					{tournament.status === TournamentStatus.Setup && (
						<Badge variant="secondary">Iscrizioni</Badge>
					)}
					{tournament.status === TournamentStatus.Active && (
						<Badge className="bg-green-600">In Corso</Badge>
					)}
					{tournament.status === TournamentStatus.Finished && (
						<Badge variant="outline">Concluso</Badge>
					)}
				</div>
				<div className="text-muted-foreground flex gap-4 text-sm">
					<span>
						Formato: {tournament.teamSize} vs {tournament.teamSize}
					</span>
					<span>•</span>
					<span>Tipo: {tournament.type === 0 ? "Girone" : "Eliminazione"}</span>
				</div>
			</div>

			<div className="flex gap-2 flex-wrap">
				{/* ACTION BUTTONS */}

				{/* Admin: Start */}
				{isAdmin && tournament.status === TournamentStatus.Setup && (
					<Button
						onClick={() => startMutation.mutate(tournament.id)}
						disabled={tournament.teams.length < 2 || startMutation.isPending}
						className="bg-green-600 hover:bg-green-700"
					>
						<PlayCircle className="mr-2 h-4 w-4" /> Avvia Torneo
					</Button>
				)}

				{/* Admin: AI Generate (2v2) */}
				{isAdmin &&
					tournament.status === TournamentStatus.Setup &&
					tournament.teamSize === 2 && (
						<GenerateTeamsButton tournamentId={tournament.id} />
					)}

				{/* User: Join (1v1) */}
				{isAuthenticated &&
					tournament.status === TournamentStatus.Setup &&
					tournament.teamSize === 1 && (
						<JoinTournamentButton tournamentId={tournament.id} />
					)}
			</div>
		</div>
	);
};
