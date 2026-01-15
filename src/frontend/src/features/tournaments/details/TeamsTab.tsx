import { User, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { type TournamentDetail, TournamentStatus } from "@/types";
import { RegisterTeamForm } from "../RegisterTeamForm";
import { cn } from "@/lib/utils";

interface Props {
	tournament: TournamentDetail;
}

export const TeamsTab = ({ tournament }: Props) => {
	const { isAdmin } = useAuth();

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Colonna SX: Lista Squadre */}
			<div className="lg:col-span-2 grid gap-6 sm:grid-cols-2">
				{tournament.teams.length === 0 && (
					<div className="col-span-full text-center py-16 text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed border-border/60">
						<Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
						<p className="text-lg font-medium">Nessuna squadra iscritta</p>
						<p className="text-sm opacity-70">In attesa che i team si registrino al torneo.</p>
					</div>
				)}

				{tournament.teams.map((team) => (
					<Card key={team.id} className="group flex flex-col border-border bg-card transition-all hover:shadow-lg hover:border-primary/20">
						{/* Header Squadra */}
						<div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
									<Users className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
										{team.name}
									</h3>
									<p className="text-[10px] text-muted-foreground font-semibold">
										ID: {team.id.split("-")[0]}
									</p>
								</div>
							</div>
						</div>

						{/* Lista Giocatori (Verticale) */}
						<div className="p-2 flex flex-col gap-1">
							{team.players && team.players.length > 0 ? (
								team.players.map((player) => (
									<div
										key={player.id}
										className="group/player flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-muted/50"
									>
										{/* Icona Glassmorphism */}
										<div className={cn(
											"relative flex items-center justify-center h-9 w-9 rounded-full",
											"bg-white/40 dark:bg-white/5", // Glass effect base
											"backdrop-blur-md border border-white/40 dark:border-white/10", // Blur e bordo light
											"shadow-sm group-hover/player:border-primary/30 transition-all"
										)}>
											<User className="h-4 w-4 text-muted-foreground group-hover/player:text-primary transition-colors" />
										</div>

										<div className="flex flex-col">
											<span className="text-sm font-semibold text-foreground/90 group-hover/player:text-foreground">
												{player.nickname}
											</span>
											<span className="text-[10px] text-muted-foreground uppercase tracking-tighter">
												Player
											</span>
										</div>
									</div>
								))
							) : (
								<div className="py-6 text-center">
									<p className="text-xs text-muted-foreground italic">Nessun giocatore in lista</p>
								</div>
							)}
						</div>
					</Card>
				))}
			</div>

			{/* Colonna DX: Form sticky */}
			{tournament.status === TournamentStatus.Setup && isAdmin && (
				<div className="lg:col-span-1">
					<div className="sticky top-6">
						<RegisterTeamForm tournamentId={tournament.id} />
					</div>
				</div>
			)}
		</div>
	);
};
