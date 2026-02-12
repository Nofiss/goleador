import { Edit2, ImagePlus, Trash2, User, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { TournamentTeam } from "@/types";
import { RenameTeamDialog } from "./RenameTeamDialog";
import { TeamBrandingDialog } from "./TeamBrandingDialog";

interface TeamCardProps {
	team: TournamentTeam;
	tournamentId: string;
	isAdmin?: boolean;
	isSetup?: boolean;
}

export const TeamCard = ({ team, tournamentId, isAdmin, isSetup }: TeamCardProps) => {
	const [isRenameOpen, setIsRenameOpen] = useState(false);
	const [isBrandingOpen, setIsBrandingOpen] = useState(false);

	const getImageUrl = (url?: string) => {
		if (!url) return null;
		if (url.startsWith("http")) return url;
		const baseUrl = import.meta.env.VITE_API_URL || "";
		return `${baseUrl}${url}`;
	};

	return (
		<>
			<Card className="overflow-hidden border rounded-xl shadow-sm bg-card transition-all hover:shadow-md hover:border-primary/30 group flex flex-col">
				{/* Header */}
				<div className="p-5 border-b bg-muted/20 flex items-center justify-between">
					<div className="flex items-center gap-3">
						{team.logoUrl ? (
							<img
								src={getImageUrl(team.logoUrl) ?? ""}
								alt={team.name}
								className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
							/>
						) : (
							<div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary">
								<Users className="h-4 w-4" />
							</div>
						)}
						<div>
							<h3 className="font-semibold text-base tracking-tight">{team.name}</h3>
							{isAdmin && (
								<p className="text-[10px] font-mono text-muted-foreground opacity-60">
									#{team.id.split("-")[0]}
								</p>
							)}
						</div>
					</div>

					<div className="flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
						{isAdmin && (
							<>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-primary focus-visible:opacity-100"
									onClick={() => setIsBrandingOpen(true)}
									aria-label="Modifica branding squadra"
								>
									<ImagePlus className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground hover:text-primary focus-visible:opacity-100"
									onClick={() => setIsRenameOpen(true)}
									aria-label="Modifica nome squadra"
								>
									<Edit2 className="h-4 w-4" />
								</Button>
							</>
						)}
						{isSetup && (
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 text-destructive hover:bg-destructive/10 focus-visible:opacity-100"
								aria-label="Elimina squadra"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				{/* Players List */}
				<div className="p-5 space-y-1 flex-1">
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

				{/* Sponsor footer */}
				{team.sponsorUrl && (
					<div className="px-5 py-2 bg-muted/5 border-t flex items-center justify-center gap-2">
						<span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest">
							Powered by
						</span>
						<img
							src={getImageUrl(team.sponsorUrl) ?? ""}
							alt="Sponsor"
							className="h-6 max-w-[120px] object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all"
						/>
					</div>
				)}
			</Card>

			{/* Dialog di Rinomina */}
			<RenameTeamDialog
				team={isRenameOpen ? { id: team.id, name: team.name } : null}
				tournamentId={tournamentId}
				onClose={() => setIsRenameOpen(false)}
			/>

			{/* Dialog di Branding */}
			<TeamBrandingDialog
				team={isBrandingOpen ? team : null}
				tournamentId={tournamentId}
				onClose={() => setIsBrandingOpen(false)}
			/>
		</>
	);
};
