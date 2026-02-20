import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";

export const JoinTournamentButton = ({ tournamentId }: { tournamentId: string }) => {
	const [open, setOpen] = useState(false);
	const [teamName, setTeamName] = useState("");
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: () => joinTournament(tournamentId, teamName),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			toast.success("Ti sei iscritto al torneo! 🎉");
			setOpen(false);
			setTeamName(""); // Reset field on success
		},
		onError: () => {
			toast.error("Errore durante l'iscrizione");
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="default" className="bg-blue-600 hover:bg-blue-700">
					<UserPlus className="mr-2 h-4 w-4" aria-hidden="true" /> Partecipa
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Iscrizione Torneo</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="teamName">Nome Squadra</Label>
						<p id="teamName-desc" className="text-sm text-muted-foreground">
							Inserisci il nome con cui vuoi apparire in classifica (es. il tuo Nickname o nome di
							battaglia).
						</p>
						<div className="relative">
							<Input
								id="teamName"
								placeholder="Il tuo Nickname"
								value={teamName}
								onChange={(e) => setTeamName(e.target.value)}
								aria-describedby="teamName-desc"
								className="pl-9"
							/>
							<User
								className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50"
								aria-hidden="true"
							/>
						</div>
					</div>
					<Button
						className="w-full"
						onClick={() => mutation.mutate()}
						loading={mutation.isPending}
						disabled={!teamName.trim()}
					>
						Conferma Iscrizione
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
