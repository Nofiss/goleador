import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api/axios";
import { getPlayers } from "@/api/players";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface CreateMatchRequest {
	playerHomeId: string;
	playerAwayId: string;
	scoreHome: number;
	scoreAway: number;
}

export const CreateMatchForm = () => {
	const queryClient = useQueryClient();
	const [message, setMessage] = useState<string>("");

	// Stato del form
	const [formData, setFormData] = useState<CreateMatchRequest>({
		playerHomeId: "",
		playerAwayId: "",
		scoreHome: 0,
		scoreAway: 0,
	});

	// 1. Carichiamo i giocatori per le dropdown
	const { data: players, isLoading: isLoadingPlayers } = useQuery({
		queryKey: ["players"],
		queryFn: getPlayers,
	});

	// 2. Mutation per salvare la partita
	const mutation = useMutation({
		mutationFn: (data: CreateMatchRequest) => api.post("/api/matches", data),
		onSuccess: () => {
			setMessage("✅ Partita registrata!");
			setFormData({ ...formData, scoreHome: 0, scoreAway: 0 }); // Reset solo punteggi
			// In futuro invalideremo la query delle partite
		},
		onError: (error: any) => {
			setMessage("❌ Errore durante il salvataggio.");
			console.error(error);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validazione base lato client
		if (formData.playerHomeId === formData.playerAwayId) {
			setMessage("❌ Un giocatore non può giocare contro se stesso!");
			return;
		}

		if (!formData.playerHomeId || !formData.playerAwayId) {
			setMessage("❌ Seleziona entrambi i giocatori.");
			return;
		}

		mutation.mutate(formData);
	};

	if (isLoadingPlayers) return <div>Caricamento giocatori...</div>;

	return (
		<div className="max-w-xl mx-auto p-6 bg-white border rounded-lg shadow-sm">
			<h2 className="text-2xl font-bold mb-6 text-center">
				Registra Risultato 1vs1
			</h2>

			<form onSubmit={handleSubmit} className="space-y-6">
				{/* Selezione Giocatori */}
				<div className="grid grid-cols-2 gap-8">
					{/* SQUADRA CASA */}
					<div className="space-y-2">
						<Label className="text-blue-600 font-bold">Casa (Blu)</Label>
						<Select
							onValueChange={(val) =>
								setFormData({ ...formData, playerHomeId: val })
							}
							value={formData.playerHomeId}
						>
							<SelectTrigger>
								<SelectValue placeholder="Giocatore 1" />
							</SelectTrigger>
							<SelectContent>
								{players?.map((p) => (
									<SelectItem key={p.id} value={p.id}>
										{p.nickname}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* SQUADRA OSPITE */}
					<div className="space-y-2">
						<Label className="text-red-600 font-bold">Ospiti (Rossi)</Label>
						<Select
							onValueChange={(val) =>
								setFormData({ ...formData, playerAwayId: val })
							}
							value={formData.playerAwayId}
						>
							<SelectTrigger>
								<SelectValue placeholder="Giocatore 2" />
							</SelectTrigger>
							<SelectContent>
								{players?.map((p) => (
									<SelectItem key={p.id} value={p.id}>
										{p.nickname}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Punteggio */}
				<div className="flex items-center justify-center gap-4 bg-gray-50 p-4 rounded-lg">
					<div className="text-center">
						<Input
							type="number"
							min="0"
							className="w-20 text-center text-2xl font-bold"
							value={formData.scoreHome}
							onChange={(e) =>
								setFormData({
									...formData,
									scoreHome: parseInt(e.target.value) || 0,
								})
							}
						/>
					</div>
					<span className="text-2xl font-bold text-gray-400">-</span>
					<div className="text-center">
						<Input
							type="number"
							min="0"
							className="w-20 text-center text-2xl font-bold"
							value={formData.scoreAway}
							onChange={(e) =>
								setFormData({
									...formData,
									scoreAway: parseInt(e.target.value) || 0,
								})
							}
						/>
					</div>
				</div>

				<Button
					type="submit"
					className="w-full h-12 text-lg"
					disabled={mutation.isPending}
				>
					{mutation.isPending ? "Salvataggio..." : "Conferma Partita"}
				</Button>

				{message && (
					<div
						className={`p-3 rounded text-center text-sm font-medium ${message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
					>
						{message}
					</div>
				)}
			</form>
		</div>
	);
};
