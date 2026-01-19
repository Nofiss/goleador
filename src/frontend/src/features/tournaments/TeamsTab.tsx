import { ShieldPlus, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
	const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

	const assignedPlayerIds = new Set(tournament.teams.flatMap((t) => t.players.map((p) => p.id)));
	const availableCandidates = tournament.registeredPlayers.filter(
		(p) => !assignedPlayerIds.has(p.id),
	);

	const isSetup = tournament.status === TournamentStatus.setup;

	const newLocal = "text-sm text-muted-foreground/60 max-w-[250px] text-center";
	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* ADMIN TOOLBAR */}
			{isAdmin && isSetup && (
				<div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border/50">
					<div className="flex items-center gap-2">
						<div className="p-2 bg-primary/10 rounded-lg">
							<ShieldPlus className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 className="text-sm font-bold">Gestione Squadre</h3>
							<p className="text-xs text-muted-foreground">
								Configura i partecipanti prima dell'avvio
							</p>
						</div>
					</div>
					<div className="flex gap-2 w-full md:w-auto">
						<Button
							variant="default"
							className="flex-1 md:flex-none gap-2"
							onClick={() => setIsRegisterDialogOpen(true)}
						>
							<Users className="h-4 w-4" />
							Crea Squadra
						</Button>
					</div>
				</div>
			)}

			{/* POOL SECTION - Ora più integrata e meno invasiva */}
			{isSetup && isAdmin && (
				<PlayerPool
					tournamentId={tournament.id}
					registeredPlayers={tournament.registeredPlayers || []}
					assignedPlayerIds={Array.from(assignedPlayerIds)}
				/>
			)}

			{/* LISTA SQUADRE - Full Width */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
						Squadre Partecipanti
						<span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
							{tournament.teams.length}
						</span>
					</h2>
				</div>

				{tournament.teams.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-[2rem] bg-muted/5 border-muted-foreground/20">
						<Users className="h-12 w-12 text-muted-foreground/20 mb-4" />
						<p className="text-lg font-medium text-muted-foreground">Nessuna squadra formata</p>
						<p className={newLocal}>
							{isAdmin
								? "Inizia iscrivendo i giocatori al pool e poi crea le squadre."
								: "L'organizzatore non ha ancora configurato le squadre."}
						</p>
					</div>
				) : (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{tournament.teams.map((team) => (
							<TeamCard
								key={team.id}
								team={team}
								tournamentId={tournament.id}
								isAdmin={isAdmin && isSetup}
							/>
						))}
					</div>
				)}
			</div>

			{/* MODALE DI REGISTRAZIONE */}
			<RegisterTeamForm
				isOpen={isRegisterDialogOpen}
				onOpenChange={setIsRegisterDialogOpen}
				tournamentId={tournament.id}
				availableCandidates={availableCandidates}
			/>
		</div>
	);
};
