// src/features/tournaments/CreateTournamentForm.tsx

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronDown,
	ChevronUp,
	FileText,
	Loader2,
	Plus,
	Swords,
	Trash2,
	Trophy,
	Users,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { createTournament } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CardEffect, type CreateTournamentRequest, TournamentType } from "@/types";

interface Props {
	onSuccess: () => void;
}

export const CreateTournamentForm = ({ onSuccess }: Props) => {
	const queryClient = useQueryClient();
	const [showAdvanced, setShowAdvanced] = useState(false);

	const [formData, setFormData] = useState<CreateTournamentRequest>({
		name: "",
		type: TournamentType.roundRobin,
		teamSize: 1, // Default 1vs1
		hasReturnMatches: false,
		rules: "",
		pointsForWin: 3,
		pointsForDraw: 1,
		pointsForLoss: 0,
		goalThreshold: undefined, // undefined manda null al backend
		goalThresholdBonus: 0,
		enableTenZeroBonus: false,
		tenZeroBonus: 0,
	});

	const mutation = useMutation({
		mutationFn: createTournament,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournaments"] });
			onSuccess();
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Rimuovo le chiavi temporanee usate per le animazioni prima di inviare al backend
		const cleanCards = formData.cards?.map(({ name, description, effect }) => ({
			name,
			description,
			effect,
		}));
		mutation.mutate({ ...formData, cards: cleanCards });
	};

	const addCard = () => {
		const newCards = [...(formData.cards || [])];
		// Aggiungo una chiave unica per AnimatePresence
		(newCards as any).push({
			name: "",
			description: "",
			effect: CardEffect.none,
			id: crypto.randomUUID(),
		});
		setFormData({ ...formData, cards: newCards });
	};

	const removeCard = (index: number) => {
		const newCards = [...(formData.cards || [])];
		newCards.splice(index, 1);
		setFormData({ ...formData, cards: newCards });
	};

	const updateCard = (index: number, field: string, value: string | number) => {
		const newCards = [...(formData.cards || [])];
		newCards[index] = { ...newCards[index], [field]: value };
		setFormData({ ...formData, cards: newCards });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<Card>
				<CardContent className="pt-6 space-y-4">
					<div className="space-y-2">
						<Label htmlFor="tournament-name">Nome Torneo</Label>
						<div className="relative">
							<Input
								id="tournament-name"
								className="pl-9"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="Es. Champions League 2026"
								required
							/>
							<Trophy
								className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 pointer-events-none"
								aria-hidden="true"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="tournament-type">Modalità</Label>
							<div className="relative">
								<Select
									value={formData.type.toString()}
									onValueChange={(v) =>
										setFormData({
											...formData,
											type: parseInt(v, 10) as TournamentType,
										})
									}
								>
									<SelectTrigger id="tournament-type" className="pl-9 w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={TournamentType.roundRobin.toString()}>
											Girone (Campionato)
										</SelectItem>
										{/* Elimination non è ancora supportato dal backend scheduler, meglio nasconderlo o gestirlo */}
										<SelectItem value={TournamentType.elimination.toString()} disabled>
											Eliminazione (WIP)
										</SelectItem>
									</SelectContent>
								</Select>
								<Swords
									className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 z-10 pointer-events-none"
									aria-hidden="true"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="tournament-format">Formato</Label>
							<div className="relative">
								<Select
									value={formData.teamSize.toString()}
									onValueChange={(v) => setFormData({ ...formData, teamSize: parseInt(v, 10) })}
								>
									<SelectTrigger id="tournament-format" className="pl-9 w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="1">1 vs 1</SelectItem>
										<SelectItem value="2">2 vs 2</SelectItem>
									</SelectContent>
								</Select>
								<Users
									className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50 z-10 pointer-events-none"
									aria-hidden="true"
								/>
							</div>
						</div>

						<div className="space-y-2 col-span-2">
							<div className="flex justify-between items-center">
								<Label htmlFor="tournament-rules">Regole (Opzionale)</Label>
								<span className="text-[10px] text-muted-foreground uppercase font-bold bg-muted px-2 py-0.5 rounded">
									Supporta Markdown
								</span>
							</div>
							<div className="relative">
								<Textarea
									id="tournament-rules"
									className="pl-9 min-h-[120px] font-mono text-sm"
									placeholder="# Regolamento\n\n1. Fair play prima di tutto\n2. ..."
									value={formData.rules}
									onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
								/>
								<FileText
									className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/50 pointer-events-none"
									aria-hidden="true"
								/>
							</div>
							<p className="text-[10px] text-muted-foreground">
								Puoi usare il linguaggio Markdown per formattare il testo (grassetti, elenchi,
								titoli).
							</p>
						</div>
					</div>
					<div className="flex items-center space-x-2 pt-2">
						<Checkbox
							id="returnMatches"
							checked={formData.hasReturnMatches}
							onCheckedChange={(checked) =>
								setFormData({ ...formData, hasReturnMatches: !!checked })
							}
						/>
						<Label htmlFor="returnMatches">Andata e Ritorno</Label>
					</div>
				</CardContent>
			</Card>

			{/* Sezione Carte Torneo */}
			<Card className="border-dashed">
				<CardContent className="pt-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-2">
							<Zap className="h-5 w-5 text-yellow-500" />
							<h3 className="font-semibold">Carte Torneo (Bonus/Malus)</h3>
						</div>
						<Button type="button" variant="outline" size="sm" onClick={addCard}>
							<motion.div
								whileHover={{ rotate: 180, scale: 1.2 }}
								transition={{ type: "spring", stiffness: 300, damping: 10 }}
							>
								<Plus className="h-4 w-4" />
							</motion.div>
							<span>Aggiungi Carta</span>
						</Button>
					</div>

					<div className="space-y-4">
						{formData.cards?.length === 0 || !formData.cards ? (
							<p className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
								Nessuna carta definita per questo torneo.
							</p>
						) : (
							<AnimatePresence initial={false}>
								{formData.cards.map((card, index) => (
									<motion.div
										key={(card as any).id || index}
										initial={{ opacity: 0, height: 0, marginTop: 0 }}
										animate={{ opacity: 1, height: "auto", marginTop: 16 }}
										exit={{ opacity: 0, height: 0, marginTop: 0 }}
										transition={{ duration: 0.2 }}
										className="grid grid-cols-12 gap-2 items-start border p-3 rounded-lg bg-muted/30 overflow-hidden"
									>
										<div className="col-span-4 space-y-1">
											<Label className="text-[10px] uppercase font-bold text-muted-foreground">
												Nome
											</Label>
											<Input
												value={card.name}
												placeholder="Es. Raddoppia Punti"
												onChange={(e) => updateCard(index, "name", e.target.value)}
											/>
										</div>
										<div className="col-span-4 space-y-1">
											<Label className="text-[10px] uppercase font-bold text-muted-foreground">
												Effetto
											</Label>
											<Select
												value={card.effect.toString()}
												onValueChange={(v) => updateCard(index, "effect", parseInt(v, 10))}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={CardEffect.none.toString()}>
														Nessun effetto (descrittivo)
													</SelectItem>
													<SelectItem value={CardEffect.doublePoints.toString()}>
														Raddoppia Punti (se vince)
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="col-span-3 space-y-1">
											<Label className="text-[10px] uppercase font-bold text-muted-foreground">
												Descrizione
											</Label>
											<Input
												value={card.description}
												placeholder="Es. Usala per raddoppiare i punti..."
												onChange={(e) => updateCard(index, "description", e.target.value)}
											/>
										</div>
										<div className="col-span-1 pt-6 flex justify-end">
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive"
												onClick={() => removeCard(index)}
												aria-label="Rimuovi carta"
												title="Rimuovi carta"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</motion.div>
								))}
							</AnimatePresence>
						)}
					</div>
				</CardContent>
			</Card>

			{/* Sezione Avanzate (Punteggi) */}
			<Card className="border-dashed">
				<CardContent className="pt-6">
					<Button
						type="button"
						variant="ghost"
						className="w-full justify-between"
						onClick={() => setShowAdvanced(!showAdvanced)}
					>
						<span className="flex items-center gap-2">
							{showAdvanced ? "Nascondi Regole Punteggio" : "Configura Punteggi Personalizzati"}
						</span>
						{showAdvanced ? (
							<ChevronUp className="h-4 w-4" aria-hidden="true" />
						) : (
							<ChevronDown className="h-4 w-4" aria-hidden="true" />
						)}
					</Button>
					{showAdvanced && (
						<div className="mt-4 space-y-4">
							<div className="grid grid-cols-3 gap-2">
								<div>
									<Label htmlFor="points-win" className="text-xs">
										Vittoria
									</Label>
									<Input
										id="points-win"
										type="number"
										aria-label="Punti per Vittoria"
										value={formData.pointsForWin}
										onChange={(e) =>
											setFormData({
												...formData,
												pointsForWin: parseInt(e.target.value, 10),
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="points-draw" className="text-xs">
										Pareggio
									</Label>
									<Input
										id="points-draw"
										type="number"
										aria-label="Punti per Pareggio"
										value={formData.pointsForDraw}
										onChange={(e) =>
											setFormData({
												...formData,
												pointsForDraw: parseInt(e.target.value, 10),
											})
										}
									/>
								</div>
								<div>
									<Label htmlFor="points-loss" className="text-xs">
										Sconfitta
									</Label>
									<Input
										id="points-loss"
										type="number"
										aria-label="Punti per Sconfitta"
										value={formData.pointsForLoss}
										onChange={(e) =>
											setFormData({
												...formData,
												pointsForLoss: parseInt(e.target.value, 10),
											})
										}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="goal-threshold">Bonus Goal</Label>
								<div className="flex gap-2 items-center">
									<span className="text-sm">Se segnati &ge;</span>
									<Input
										id="goal-threshold"
										className="w-16"
										type="number"
										placeholder="4"
										aria-label="Soglia goal"
										value={formData.goalThreshold || ""}
										onChange={(e) =>
											setFormData({
												...formData,
												goalThreshold: e.target.value ? parseInt(e.target.value, 10) : undefined,
											})
										}
									/>
									<span className="text-sm">goal, +</span>
									<Input
										id="goal-threshold-bonus"
										className="w-16"
										type="number"
										aria-label="Bonus Soglia Goal"
										value={formData.goalThresholdBonus}
										onChange={(e) =>
											setFormData({
												...formData,
												goalThresholdBonus: parseInt(e.target.value, 10),
											})
										}
									/>
									<span className="text-sm">punti.</span>
								</div>
							</div>

							<div className="flex items-center space-x-2">
								<Checkbox
									id="tenZero"
									checked={formData.enableTenZeroBonus}
									onCheckedChange={(c) => setFormData({ ...formData, enableTenZeroBonus: !!c })}
								/>
								<Label htmlFor="tenZero">Bonus 10-0 (Cappotto)</Label>
							</div>
							{formData.enableTenZeroBonus && (
								<div className="flex gap-2 items-center ml-6">
									<Label htmlFor="ten-zero-bonus" className="text-sm">
										Punti Extra:
									</Label>
									<Input
										id="ten-zero-bonus"
										className="w-16"
										type="number"
										aria-label="Bonus Cappotto"
										value={formData.tenZeroBonus}
										onChange={(e) =>
											setFormData({
												...formData,
												tenZeroBonus: parseInt(e.target.value, 10),
											})
										}
									/>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			<div className="flex justify-end gap-4">
				<Button type="submit" size="lg" disabled={mutation.isPending} className="group">
					{mutation.isPending ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
							Creazione...
						</>
					) : (
						<>
							<motion.div
								whileHover={{ rotate: [0, -10, 10, -10, 10, 0] }}
								transition={{ duration: 0.5 }}
							>
								<Trophy className="mr-2 h-4 w-4" aria-hidden="true" />
							</motion.div>
							Crea Torneo
						</>
					)}
				</Button>
			</div>
		</form>
	);
};
