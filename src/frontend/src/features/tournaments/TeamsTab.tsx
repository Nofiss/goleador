import { Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { type TournamentDetail, TournamentStatus } from "@/types";
import { PlayerPool } from "./teams/PlayerPool";
import { RegisterTeamForm } from "./teams/RegisterTeamForm";
import { TeamCard } from "./teams/TeamCard";

interface Props {
	tournament: TournamentDetail;
}

export const TeamsTab = ({ tournament }: Props) => {
	const { isAdmin } = useAuth();

	// Calcoliamo i giocatori già assegnati a un team
	const assignedPlayerIds = new Set(tournament.teams.flatMap((t) => t.players.map((p) => p.id)));

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* POOL SECTION - Solo Admin & Setup */}
			{tournament.status === TournamentStatus.Setup && isAdmin && (
				<PlayerPool
					tournamentId={tournament.id}
					registeredPlayers={tournament.registeredPlayers || []}
					assignedPlayerIds={Array.from(assignedPlayerIds)}
				/>
			)}

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* LISTA SQUADRE */}
				<div className="lg:col-span-8 space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-bold tracking-tight">
							Squadre Partecipanti ({tournament.teams.length})
						</h2>
					</div>

					{tournament.teams.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-3xl bg-muted/10 border-muted-foreground/20">
							<Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
							<p className="text-lg font-medium text-muted-foreground">Nessuna squadra iscritta</p>
							<p className="text-sm text-muted-foreground/60">
								In attesa della formazione dei team.
							</p>
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2">
							{tournament.teams.map((team) => (
								<TeamCard
									key={team.id}
									team={team}
									tournamentId={tournament.id}
									isAdmin={isAdmin}
								/>
							))}
						</div>
					)}
				</div>

				{/* SIDEBAR: FORM REGISTRAZIONE */}
				{tournament.status === TournamentStatus.Setup && isAdmin && (
					<div className="lg:col-span-4">
						<div className="sticky top-24">
							<RegisterTeamForm
								tournamentId={tournament.id}
								// Passiamo solo i giocatori nel pool che NON sono ancora in un team
								availableCandidates={tournament.registeredPlayers.filter(
									(p) => !assignedPlayerIds.has(p.id),
								)}
							/>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
