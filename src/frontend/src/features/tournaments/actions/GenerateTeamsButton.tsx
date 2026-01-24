import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";

export const GenerateTeamsButton = ({ tournamentId }: { tournamentId: string }) => {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: () => api.post(`/api/tournaments/${tournamentId}/generate-teams`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			toast.success("Squadre generate con successo dall'AI! 🤖");
		},
		onError: () => toast.error("Errore generazione squadre. Controlla che i giocatori siano pari!"),
	});

	return (
		<Button
			variant="secondary"
			className="bg-purple-600 hover:bg-purple-700 text-white border-purple-800"
			onClick={() => mutation.mutate()}
			disabled={mutation.isPending}
		>
			<Sparkles className="mr-2 h-4 w-4" />
			{mutation.isPending ? "L'AI sta pensando..." : "Genera Squadre AI"}
		</Button>
	);
};
