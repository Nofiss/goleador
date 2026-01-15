import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { linkUserToPlayer } from "@/api/users";
import { getPlayers } from "@/api/players";
import type { User } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Props {
	user: User | null;
	onClose: () => void;
}

export const LinkPlayerDialog = ({ user, onClose }: Props) => {
	const queryClient = useQueryClient();
	const [selectedPlayerId, setSelectedPlayerId] = useState<string>("no_link"); // "no_link" è il valore per null

	const { data: players } = useQuery({ queryKey: ["players"], queryFn: getPlayers });

	// Quando apre il dialog, imposta il valore corrente
	// Usiamo una useEffect o key nel dialog per resettare
	if (user && selectedPlayerId === "no_link" && user.playerId) {
		setSelectedPlayerId(user.playerId);
	}

	const mutation = useMutation({
		mutationFn: () => linkUserToPlayer(user!.id, selectedPlayerId === "no_link" ? null : selectedPlayerId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			onClose();
			setSelectedPlayerId("no_link");
		},
		onError: (err: any) => alert(err.response?.data?.detail || "Errore collegamento")
	});

	if (!user) return null;

	return (
		<Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Collega Giocatore</DialogTitle>
				</DialogHeader>

				<div className="py-4 space-y-4">
					<p className="text-sm text-gray-500">
						Associa l'account <strong>{user.username}</strong> a un profilo giocatore esistente per permettergli di iscriversi ai tornei.
					</p>

					<div className="space-y-2">
						<Label>Profilo Giocatore</Label>
						<Select
							value={selectedPlayerId}
							onValueChange={setSelectedPlayerId}
						>
							<SelectTrigger>
								<SelectValue placeholder="Seleziona..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="no_link">-- Nessun Collegamento --</SelectItem>
								{players?.map(p => (
									<SelectItem key={p.id} value={p.id}>
										{p.nickname} {p.fullName && `(${p.fullName})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>Annulla</Button>
					<Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
						Salva Collegamento
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
