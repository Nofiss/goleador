import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeftRight, Swords, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createMatch } from "@/api/matches";
import { getPlayers } from "@/api/players";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ScoreStepper } from "./components/ScoreStepper";

interface Props {
	onSuccess: () => void;
}

export const MatchCreateForm = ({ onSuccess }: Props) => {
	const queryClient = useQueryClient();
	const { data: players, isLoading: isLoadingPlayers } = useQuery({
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

	const handleSwap = useCallback(() => {
		setFormData((prev) => ({
			...prev,
			playerHomeId: prev.playerAwayId,
			playerAwayId: prev.playerHomeId,
			scoreHome: prev.scoreAway,
			scoreAway: prev.scoreHome,
		}));
	}, []);

	// Add keyboard listener for 'S' to swap teams
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				e.key.toLowerCase() === "s" &&
				!(e.target instanceof HTMLInputElement) &&
				!(e.target instanceof HTMLTextAreaElement)
			) {
				handleSwap();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleSwap]);

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
				<Card className="w-full md:w-1/3 border-t-4 border-t-blue-600 dark:border-t-blue-400 shadow-sm">
					<CardContent className="pt-6 text-center space-y-4">
						<Label
							htmlFor="playerHome"
							className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wide"
						>
							Squadra Casa
						</Label>
						<div className="relative">
							<Select
								value={formData.playerHomeId}
								onValueChange={(v) => setFormData({ ...formData, playerHomeId: v })}
								disabled={isLoadingPlayers}
							>
								<SelectTrigger id="playerHome" className="w-full pl-9 text-center font-medium h-12">
									<SelectValue placeholder={isLoadingPlayers ? "Caricamento..." : "Seleziona..."} />
								</SelectTrigger>
								<SelectContent>
									{players?.map((p) => (
										<SelectItem key={p.id} value={p.id} disabled={p.id === formData.playerAwayId}>
											{p.nickname}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<User
								className="absolute left-3 top-4 h-4 w-4 text-muted-foreground/50 pointer-events-none"
								aria-hidden="true"
							/>
						</div>

						<div className="pt-2">
							<ScoreStepper
								label="Punteggio Squadra Casa"
								value={formData.scoreHome}
								onChange={(v) => setFormData({ ...formData, scoreHome: v })}
								colorClass="blue"
							/>
						</div>
					</CardContent>
				</Card>

				{/* VS ICON & SWAP */}
				<div className="text-muted-foreground flex flex-col items-center gap-2">
					<Swords className="h-10 w-10 text-gray-300" aria-hidden="true" />
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						className="rounded-full hover:bg-muted"
						onClick={handleSwap}
						title="Inverti Squadre"
						aria-label="Inverti Squadre"
					>
						<motion.div
							whileHover={{ rotate: 180 }}
							whileTap={{ scale: 0.8, rotate: 180 }}
							transition={{ type: "spring", stiffness: 300, damping: 15 }}
						>
							<ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
						</motion.div>
					</Button>
					<span className="font-bold text-sm text-gray-400">VS</span>
				</div>

				{/* TEAM OSPITE */}
				<Card className="w-full md:w-1/3 border-t-4 border-t-red-600 dark:border-t-red-400 shadow-sm">
					<CardContent className="pt-6 text-center space-y-4">
						<Label
							htmlFor="playerAway"
							className="text-red-600 dark:text-red-400 font-bold uppercase tracking-wide"
						>
							Squadra Ospite
						</Label>
						<div className="relative">
							<Select
								value={formData.playerAwayId}
								onValueChange={(v) => setFormData({ ...formData, playerAwayId: v })}
								disabled={isLoadingPlayers}
							>
								<SelectTrigger id="playerAway" className="w-full pl-9 text-center font-medium h-12">
									<SelectValue placeholder={isLoadingPlayers ? "Caricamento..." : "Seleziona..."} />
								</SelectTrigger>
								<SelectContent>
									{players?.map((p) => (
										<SelectItem key={p.id} value={p.id} disabled={p.id === formData.playerHomeId}>
											{p.nickname}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<User
								className="absolute left-3 top-4 h-4 w-4 text-muted-foreground/50 pointer-events-none"
								aria-hidden="true"
							/>
						</div>

						<div className="pt-2">
							<ScoreStepper
								label="Punteggio Squadra Ospite"
								value={formData.scoreAway}
								onChange={(v) => setFormData({ ...formData, scoreAway: v })}
								colorClass="red"
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
					loading={mutation.isPending}
					disabled={isSamePlayer || !formData.playerHomeId || !formData.playerAwayId}
				>
					Registra Risultato
				</Button>
			</div>
		</form>
	);
};
