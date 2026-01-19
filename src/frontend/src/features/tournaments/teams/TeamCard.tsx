import { Edit2, Trash2, User, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TournamentTeam } from "@/types";
import { RenameTeamDialog } from "./RenameTeamDialog";

interface TeamCardProps {
	team: TournamentTeam;
	tournamentId: string;
	isAdmin?: boolean;
	isSetup?: boolean;
}

export const TeamCard = ({ team, tournamentId, isAdmin, isSetup }: TeamCardProps) => {
	const [isRenameOpen, setIsRenameOpen] = useState(false);
	console.log(isAdmin);

	return (
		<>
			<Card className="overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/30 group">
				{/* Header */}
				<div className="p-4 border-b bg-muted/20 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
							<Users className="h-4 w-4" />
						</div>
						<div>
							<h3 className="font-bold text-sm uppercase tracking-tight">{team.name}</h3>
							{isAdmin && (
								<p className="text-[10px] font-mono text-muted-foreground opacity-60">
									#{team.id.split("-")[0]}
								</p>
							)}
						</div>
					</div>

					<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
						{isAdmin && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-muted-foreground hover:text-primary"
								onClick={() => setIsRenameOpen(true)}
							>
								<Edit2 className="h-4 w-4" />
							</Button>
						)}
						{isSetup && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-destructive hover:bg-destructive/10"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				{/* Players List */}
				<div className="p-3 space-y-1">
					{team.players.map((player) => (
						<div
							key={player.id}
							className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors group/player"
						>
							<div className="h-8 w-8 rounded-full bg-background border flex items-center justify-center text-muted-foreground group-hover/player:border-primary/50 group-hover/player:text-primary transition-all">
								<User className="h-4 w-4" />
							</div>
							<div className="flex flex-col">
								<span className="text-sm font-medium leading-none">{player.nickname}</span>
								<span className="text-[10px] text-muted-foreground uppercase mt-1">Player</span>
							</div>
						</div>
					))}
				</div>
			</Card>

			{/* Dialog di Rinomina */}
			<RenameTeamDialog
				team={isRenameOpen ? { id: team.id, name: team.name } : null}
				tournamentId={tournamentId}
				onClose={() => setIsRenameOpen(false)}
			/>
		</>
	);
};
