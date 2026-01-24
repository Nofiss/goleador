import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { registerTeam } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TournamentTeamPlayer } from "@/types";

interface RegisterTeamFormProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	tournamentId: string;
	availableCandidates: TournamentTeamPlayer[];
}

export const RegisterTeamForm = ({
	isOpen,
	onOpenChange,
	tournamentId,
	availableCandidates,
}: RegisterTeamFormProps) => {
	const queryClient = useQueryClient();
	const [teamName, setTeamName] = useState("");
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

	const mutation = useMutation({
		mutationFn: registerTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			toast.success("Squadra creata con successo! 🏆");
			setTeamName("");
			setSelectedPlayers([]);
		},
		onError: () => toast.error("Errore durante la creazione della squadra."),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (selectedPlayers.length === 0) return;
		mutation.mutate(
			{ tournamentId, teamName, playerIds: selectedPlayers },
			{
				onSuccess: () => onOpenChange(false), // Chiudi dopo il successo
			},
		);
	};

	const togglePlayer = (id: string) => {
		setSelectedPlayers((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Crea Nuova Squadra</DialogTitle>
					<DialogDescription>
						Assegna un nome e seleziona i giocatori dal pool degli iscritti.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-6 pt-4">
					<div className="space-y-2">
						<Label htmlFor="teamName" className="text-xs uppercase font-bold text-muted-foreground">
							Nome Squadra
						</Label>
						<Input
							id="teamName"
							value={teamName}
							onChange={(e) => setTeamName(e.target.value)}
							placeholder="Es. Team Alpha"
							className="bg-background"
							required
						/>
					</div>

					<div className="space-y-2">
						<Label className="text-xs uppercase font-bold text-muted-foreground">
							Seleziona Giocatori Liberi ({availableCandidates.length})
						</Label>
						<ScrollArea className="h-50 w-full rounded-md border bg-muted/20 p-3">
							{availableCandidates.length === 0 ? (
								<p className="text-xs text-center text-muted-foreground py-10">
									Nessun giocatore disponibile nel pool. <br /> Aggiungili prima al pool.
								</p>
							) : (
								<div className="space-y-3 p-1">
									{availableCandidates.map((player) => (
										<div key={player.id} className="flex items-center space-x-3 group">
											<Checkbox
												id={`p-${player.id}`}
												checked={selectedPlayers.includes(player.id)}
												onCheckedChange={() => togglePlayer(player.id)}
												className="data-[state=checked]:bg-primary"
											/>
											<label
												htmlFor={`p-${player.id}`}
												className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors"
											>
												{player.nickname}
											</label>
										</div>
									))}
								</div>
							)}
						</ScrollArea>
					</div>

					<Button
						type="submit"
						className="w-full font-bold"
						disabled={mutation.isPending || !teamName || selectedPlayers.length === 0}
					>
						{mutation.isPending ? "Registrazione..." : "Crea Squadra"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
};
