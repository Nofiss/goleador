import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlayCircle } from "lucide-react";
import { useState } from "react";
import { startTournament } from "@/api/tournaments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { type TournamentDetail, TournamentStatus } from "@/types";
import { GenerateTeamsButton } from "./actions/GenerateTeamsButton";
import { JoinTournamentButton } from "./actions/JoinTournamentButton";

interface Props {
	tournament: TournamentDetail;
}

export const TournamentHeaderSkeleton = () => (
	<div className="flex flex-col md:flex-row justify-between items-start gap-4">
		<div className="space-y-3">
			<div className="flex items-center gap-3">
				<Skeleton className="h-9 w-64" />
				<Skeleton className="h-6 w-20 rounded-full" />
			</div>
			<div className="flex gap-4">
				<Skeleton className="h-4 w-24" />
				<Skeleton className="h-4 w-24" />
			</div>
		</div>
		<div className="flex gap-2">
			<Skeleton className="h-10 w-32" />
			<Skeleton className="h-10 w-32" />
		</div>
	</div>
);

export const TournamentHeader = ({ tournament }: Props) => {
	const { isAdmin, isAuthenticated } = useAuth();
	const queryClient = useQueryClient();
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);

	const startMutation = useMutation({
		mutationFn: startTournament,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["tournament", tournament.id],
			});
			setIsConfirmOpen(false);
		},
	});

	return (
		<div className="flex flex-col md:flex-row justify-between items-start gap-4">
			<div>
				<div className="flex items-center gap-3 mb-2">
					<h1 className="text-3xl font-bold tracking-tight">{tournament.name}</h1>
					{tournament.status === TournamentStatus.setup && (
						<Badge variant="secondary">Iscrizioni</Badge>
					)}
					{tournament.status === TournamentStatus.active && (
						<Badge className="bg-green-600">In Corso</Badge>
					)}
					{tournament.status === TournamentStatus.finished && (
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
				{isAdmin && tournament.status === TournamentStatus.setup && (
					<>
						<Button
							onClick={() => setIsConfirmOpen(true)}
							disabled={tournament.teams.length < 2}
							className="bg-green-600 hover:bg-green-700"
						>
							<PlayCircle className="mr-2 h-4 w-4" aria-hidden="true" />
							Avvia Torneo
						</Button>

						<Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
							<DialogContent className="sm:max-w-md">
								<DialogHeader>
									<DialogTitle>Avvia Torneo</DialogTitle>
									<DialogDescription className="pt-2">
										Sei sicuro di voler avviare il torneo <strong>{tournament.name}</strong>?
										<br />
										<br />
										Questa azione genererà il calendario delle partite e{" "}
										<strong>non sarà più possibile</strong> modificare le squadre o iscrivere nuovi
										giocatori.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter className="mt-4">
									<Button
										variant="outline"
										onClick={() => setIsConfirmOpen(false)}
										disabled={startMutation.isPending}
									>
										Annulla
									</Button>
									<Button
										onClick={() => startMutation.mutate(tournament.id)}
										loading={startMutation.isPending}
										className="bg-green-600 hover:bg-green-700"
									>
										Conferma e Inizia
									</Button>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					</>
				)}

				{/* Admin: AI Generate (2v2) */}
				{isAdmin && tournament.status === TournamentStatus.setup && tournament.teamSize === 2 && (
					<GenerateTeamsButton tournamentId={tournament.id} />
				)}

				{/* User: Join (1v1) */}
				{isAuthenticated &&
					tournament.status === TournamentStatus.setup &&
					tournament.teamSize === 1 && <JoinTournamentButton tournamentId={tournament.id} />}
			</div>
		</div>
	);
};
