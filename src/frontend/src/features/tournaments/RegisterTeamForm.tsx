import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getPlayers } from "@/api/players";
import { registerTeam } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const RegisterTeamForm = ({
	tournamentId,
}: {
	tournamentId: string;
}) => {
	const queryClient = useQueryClient();
	const [teamName, setTeamName] = useState("");
	const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

	const { data: players } = useQuery({
		queryKey: ["players"],
		queryFn: getPlayers,
	});

	const mutation = useMutation({
		mutationFn: registerTeam,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			setTeamName("");
			setSelectedPlayers([]);
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		mutation.mutate({ tournamentId, teamName, playerIds: selectedPlayers });
	};

	const togglePlayer = (id: string) => {
		setSelectedPlayers((prev) =>
			prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
		);
	};

	return (
		<div className="p-4 border rounded-lg bg-gray-50 mt-4">
			<h3 className="font-semibold mb-4">Iscrivi Nuova Squadra</h3>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<Label>Nome Squadra</Label>
					<Input
						value={teamName}
						onChange={(e) => setTeamName(e.target.value)}
						placeholder="Es. I Pirati"
						required
					/>
				</div>

				<div>
					<Label className="mb-2 block">Seleziona Giocatori</Label>
					<div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
						{players?.map((player) => (
							<div key={player.id} className="flex items-center space-x-2">
								<Checkbox
									id={player.id}
									checked={selectedPlayers.includes(player.id)}
									onCheckedChange={() => togglePlayer(player.id)}
								/>
								<label
									htmlFor={player.id}
									className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
								>
									{player.nickname}
								</label>
							</div>
						))}
					</div>
				</div>

				<Button type="submit" disabled={mutation.isPending}>
					Iscrivi Squadra
				</Button>
			</form>
		</div>
	);
};
