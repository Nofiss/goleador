import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { type TournamentDetail, TournamentStatus } from "@/types";
import { RegisterTeamForm } from "../RegisterTeamForm";

interface Props {
	tournament: TournamentDetail;
}

export const TeamsTab = ({ tournament }: Props) => {
	const { isAdmin } = useAuth();

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Colonna SX: Lista */}
			<div className="lg:col-span-2 grid gap-4 sm:grid-cols-2">
				{tournament.teams.length === 0 && (
					<div className="col-span-full text-center py-10 text-muted-foreground bg-gray-50 rounded border border-dashed">
						Nessuna squadra iscritta.
					</div>
				)}

				{tournament.teams.map((team) => (
					<Card key={team.id} className="overflow-hidden">
						<div className="bg-gray-100 p-3 border-b flex items-center gap-2">
							<Users className="h-4 w-4 text-gray-500" />
							<span className="font-bold text-sm truncate">{team.name}</span>
						</div>
						{/* Nota: Se avessimo i player nel DTO della squadra, potremmo mostrarli qui.
                Per ora mostriamo solo il nome della squadra come da DTO attuale. */}
					</Card>
				))}
			</div>

			{/* Colonna DX: Form (Solo Setup & Admin) */}
			{tournament.status === TournamentStatus.Setup && isAdmin && (
				<div className="lg:col-span-1">
					<RegisterTeamForm tournamentId={tournament.id} />
				</div>
			)}
		</div>
	);
};
