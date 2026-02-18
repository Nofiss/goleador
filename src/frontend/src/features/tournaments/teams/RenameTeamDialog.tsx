import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { renameTeam } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
	team: { id: string; name: string } | null;
	tournamentId: string;
	onClose: () => void;
}

export const RenameTeamDialog = ({ team, tournamentId, onClose }: Props) => {
	const queryClient = useQueryClient();
	const [name, setName] = useState("");

	useEffect(() => {
		if (team) setName(team.name);
	}, [team]);

	const mutation = useMutation({
		mutationFn: ({ id, newName }: { id: string; newName: string }) => renameTeam(id, newName),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			queryClient.invalidateQueries({ queryKey: ["standings", tournamentId] });
			toast.success("Squadra rinominata con successo!");
			onClose();
		},
		onError: () => toast.error("Errore durante la rinomina."),
	});

	if (!team) return null;

	const handleSave = () => {
		if (team?.id && name.trim()) {
			mutation.mutate({ id: team.id, newName: name.trim() });
		}
	};

	return (
		<Dialog open={!!team} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Modifica Nome Squadra</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<Label>Nuovo Nome</Label>
						<Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<Button onClick={handleSave} loading={mutation.isPending} disabled={!name.trim()}>
						Salva
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
