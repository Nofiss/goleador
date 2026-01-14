import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { createTable } from "@/api/tables";
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

export const CreateTableDialog = () => {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [location, setLocation] = useState("");
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: createTable,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			setOpen(false);
			setName("");
			setLocation("");
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" /> Aggiungi Tavolo
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nuovo Tavolo</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 pt-4">
					<div>
						<Label>Nome (es. "Il Rosso")</Label>
						<Input value={name} onChange={(e) => setName(e.target.value)} />
					</div>
					<div>
						<Label>Posizione (es. "Sala Relax")</Label>
						<Input
							value={location}
							onChange={(e) => setLocation(e.target.value)}
						/>
					</div>
					<Button
						className="w-full"
						onClick={() => mutation.mutate({ name, location })}
						disabled={mutation.isPending}
					>
						Salva
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};
