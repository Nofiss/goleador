import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { joinTournament } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const JoinTournamentButton = ({ tournamentId }: { tournamentId: string }) => {
	const [open, setOpen] = useState(false);
	const [teamName, setTeamName] = useState("");
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: () => joinTournament(tournamentId, teamName),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			setOpen(false);
		},
		onError: () => {
			alert("Errore durante l'iscrizione");
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="default" className="bg-blue-600 hover:bg-blue-700">
					<UserPlus className="mr-2 h-4 w-4" /> Partecipa
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Iscrizione Torneo</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<p className="text-sm text-gray-500">
						Inserisci il nome con cui vuoi apparire in classifica (es. il tuo Nickname o nome di
						battaglia).
					</p>
					<Input
						placeholder="Nome Squadra"
						value={teamName}
						onChange={(e) => setTeamName(e.target.value)}
					/>
					<Button
						className="w-full"
						onClick={() => mutation.mutate()}
						disabled={mutation.isPending}
					>
						{mutation.isPending ? "Iscrizione..." : "Conferma Iscrizione"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
