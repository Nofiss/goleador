import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getTables } from "@/api/tables";
import { bulkAssignTable } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { TournamentPhase } from "@/types";

interface Props {
	tournamentId: string;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	hasReturnMatches: boolean;
}

export const BulkAssignTableDialog = ({
	tournamentId,
	isOpen,
	onOpenChange,
	hasReturnMatches,
}: Props) => {
	const [selectedTableId, setSelectedTableId] = useState<string>("null");
	const [selectedPhase, setSelectedPhase] = useState<TournamentPhase>(TournamentPhase.all);

	const queryClient = useQueryClient();

	const { data: tables, isLoading: isLoadingTables } = useQuery({
		queryKey: ["tables"],
		queryFn: getTables,
	});

	const mutation = useMutation({
		mutationFn: bulkAssignTable,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			toast.success("Tavoli assegnati correttamente");
			onOpenChange(false);
		},
		onError: () => {
			toast.error("Errore durante l'assegnazione dei tavoli");
		},
	});

	const handleConfirm = () => {
		const tableId = selectedTableId === "null" ? null : Number.parseInt(selectedTableId, 10);
		mutation.mutate({
			tournamentId,
			tableId,
			phase: selectedPhase,
		});
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Assegnazione Massiva Tavoli</DialogTitle>
					<DialogDescription>
						Assegna un tavolo specifico a tutte le partite selezionate.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-6 py-4">
					<div className="grid gap-2">
						<Label htmlFor="table-select">Seleziona Tavolo</Label>
						<Select value={selectedTableId} onValueChange={setSelectedTableId}>
							<SelectTrigger id="table-select">
								<SelectValue placeholder="Scegli un tavolo" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="null">Nessun Tavolo (Reset)</SelectItem>
								{tables?.map((table) => (
									<SelectItem key={table.id} value={table.id.toString()}>
										{table.name} {table.location && `(${table.location})`}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="grid gap-2">
						<Label htmlFor="phase-select">Fase del Torneo</Label>
						<Select
							value={selectedPhase.toString()}
							onValueChange={(v) => setSelectedPhase(Number.parseInt(v, 10) as TournamentPhase)}
						>
							<SelectTrigger id="phase-select">
								<SelectValue placeholder="Scegli la fase" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value={TournamentPhase.all.toString()}>Tutto il Torneo</SelectItem>
								{hasReturnMatches && (
									<>
										<SelectItem value={TournamentPhase.firstLeg.toString()}>Solo Andata</SelectItem>
										<SelectItem value={TournamentPhase.secondLeg.toString()}>
											Solo Ritorno
										</SelectItem>
									</>
								)}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="flex justify-end gap-3 mt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Annulla
					</Button>
					<Button onClick={handleConfirm} disabled={mutation.isPending || isLoadingTables}>
						{mutation.isPending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Assegnazione...
							</>
						) : (
							"Conferma"
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
