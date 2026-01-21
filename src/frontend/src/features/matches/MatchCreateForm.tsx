import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Swords } from "lucide-react";
import { useState } from "react";
import { createMatch } from "@/api/matches";
import { getPlayers } from "@/api/players";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface Props {
	onSuccess: () => void;
}

export const MatchCreateForm = ({ onSuccess }: Props) => {
	const queryClient = useQueryClient();
	const { data: players } = useQuery({
		queryKey: ["players"],
		queryFn: getPlayers,
	});

	const [formData, setFormData] = useState({
		playerHomeId: "",
		playerAwayId: "",
		scoreHome: 0,
		scoreAway: 0,
	});

	const mutation = useMutation({
		mutationFn: createMatch,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["matches"] });
			onSuccess();
		},
	});

	const isSamePlayer =
		formData.playerHomeId &&
		formData.playerAwayId &&
		formData.playerHomeId === formData.playerAwayId;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isSamePlayer || !formData.playerHomeId || !formData.playerAwayId) return;
		mutation.mutate(formData);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-8">
			<div className="flex flex-col md:flex-row items-center justify-between gap-6">
				{/* TEAM CASA */}
				<Card className="w-full md:w-1/3 border-t-4 border-t-blue-500 shadow-sm">
					<CardContent className="pt-6 text-center space-y-4">
						<Label htmlFor="playerHome" className="text-blue-700 font-bold uppercase tracking-wide">
							Squadra Casa
						</Label>
						<Select
							value={formData.playerHomeId}
							onValueChange={(v) => setFormData({ ...formData, playerHomeId: v })}
						>
							<SelectTrigger id="playerHome" className="w-full text-center font-medium h-12">
								<SelectValue placeholder="Seleziona..." />
							</SelectTrigger>
							<SelectContent>
								{players?.map((p) => (
									<SelectItem key={p.id} value={p.id}>
										{p.nickname}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="pt-2">
							<Input
								type="number"
								min="0"
								aria-label="Punteggio Squadra Casa"
								className="text-5xl font-mono text-center h-20 w-full border-blue-100 bg-blue-50/50 focus:ring-blue-500"
								value={formData.scoreHome}
								onChange={(e) =>
									setFormData({
										...formData,
										scoreHome: parseInt(e.target.value, 10) || 0,
									})
								}
							/>
						</div>
					</CardContent>
				</Card>

				{/* VS ICON */}
				<div className="text-muted-foreground flex flex-col items-center gap-2">
					<Swords className="h-10 w-10 text-gray-300" />
					<span className="font-bold text-sm text-gray-400">VS</span>
				</div>

				{/* TEAM OSPITE */}
				<Card className="w-full md:w-1/3 border-t-4 border-t-red-500 shadow-sm">
					<CardContent className="pt-6 text-center space-y-4">
						<Label htmlFor="playerAway" className="text-red-700 font-bold uppercase tracking-wide">
							Squadra Ospite
						</Label>
						<Select
							value={formData.playerAwayId}
							onValueChange={(v) => setFormData({ ...formData, playerAwayId: v })}
						>
							<SelectTrigger id="playerAway" className="w-full text-center font-medium h-12">
								<SelectValue placeholder="Seleziona..." />
							</SelectTrigger>
							<SelectContent>
								{players?.map((p) => (
									<SelectItem key={p.id} value={p.id}>
										{p.nickname}
									</SelectItem>
								))}
							</SelectContent>
						</Select>

						<div className="pt-2">
							<Input
								type="number"
								min="0"
								aria-label="Punteggio Squadra Ospite"
								className="text-5xl font-mono text-center h-20 w-full border-red-100 bg-red-50/50 focus:ring-red-500"
								value={formData.scoreAway}
								onChange={(e) =>
									setFormData({
										...formData,
										scoreAway: parseInt(e.target.value, 10) || 0,
									})
								}
							/>
						</div>
					</CardContent>
				</Card>
			</div>

			<div className="flex flex-col items-center gap-4 pt-4">
				{isSamePlayer && (
					<p
						className="text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-1"
						role="alert"
					>
						Seleziona due giocatori diversi per registrare la partita.
					</p>
				)}
				<Button
					size="lg"
					className="w-full md:w-1/3 text-lg h-12"
					type="submit"
					disabled={
						mutation.isPending || isSamePlayer || !formData.playerHomeId || !formData.playerAwayId
					}
				>
					{mutation.isPending ? "Salvataggio..." : "Registra Risultato"}
				</Button>
			</div>
		</form>
	);
};
