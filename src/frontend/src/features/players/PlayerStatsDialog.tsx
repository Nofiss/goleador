import { useQuery } from "@tanstack/react-query";
import { Activity, ShieldAlert, Trophy } from "lucide-react";
import { getPlayerStatistics } from "@/api/players";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface PlayerStatsDialogProps {
	playerId: string | null;
	onClose: () => void;
}

export const PlayerStatsDialog = ({
	playerId,
	onClose,
}: PlayerStatsDialogProps) => {
	const { data: stats, isLoading } = useQuery({
		queryKey: ["playerStats", playerId],
		queryFn: () => getPlayerStatistics(playerId!),
		enabled: !!playerId, // Esegui solo se ID è presente
	});

	return (
		<Dialog open={!!playerId} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-center text-blue-600">
						{isLoading ? "Caricamento..." : stats?.nickname}
					</DialogTitle>
				</DialogHeader>

				{stats && (
					<div className="space-y-6 py-4">
						{/* Win Rate Circle (simulato con CSS) */}
						<div className="flex flex-col items-center">
							<div className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-blue-100 bg-blue-50">
								<span className="text-xl font-bold text-blue-700">
									{stats.winRate}%
								</span>
							</div>
							<span className="text-sm text-gray-500 mt-2 font-medium">
								Win Rate
							</span>
						</div>

						<div className="grid grid-cols-3 gap-4 text-center">
							<div className="p-3 bg-green-100 rounded-lg">
								<div className="text-2xl font-bold text-green-700">
									{stats.wins}
								</div>
								<div className="text-xs text-green-600 font-semibold uppercase">
									Vittorie
								</div>
							</div>
							<div className="p-3 bg-gray-100 rounded-lg">
								<div className="text-2xl font-bold text-gray-700">
									{stats.draws}
								</div>
								<div className="text-xs text-gray-500 font-semibold uppercase">
									Pareggi
								</div>
							</div>
							<div className="p-3 bg-red-100 rounded-lg">
								<div className="text-2xl font-bold text-red-700">
									{stats.losses}
								</div>
								<div className="text-xs text-red-600 font-semibold uppercase">
									Sconfitte
								</div>
							</div>
						</div>

						<Separator />

						<div className="flex justify-between items-center px-4">
							<div className="flex items-center gap-2">
								<Trophy className="h-5 w-5 text-yellow-500" />
								<div>
									<span className="block text-sm text-gray-500">
										Goal Fatti
									</span>
									<span className="font-bold text-lg">{stats.goalsFor}</span>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<ShieldAlert className="h-5 w-5 text-red-500" />
								<div>
									<span className="block text-sm text-gray-500">
										Goal Subiti
									</span>
									<span className="font-bold text-lg">
										{stats.goalsAgainst}
									</span>
								</div>
							</div>
						</div>

						<div className="bg-secondary p-4 rounded-lg">
							<div className="flex items-center gap-2 mb-2">
								<Activity className="h-4 w-4 text-gray-400" />
								<span className="text-xs font-semibold uppercase text-gray-500">
									Forma Recente
								</span>
							</div>
							<div className="flex gap-2">
								{stats.recentForm.length === 0 && (
									<span className="text-sm text-gray-400">
										Nessuna partita recente
									</span>
								)}
								{stats.recentForm.map((result, idx) => (
									<div
										key={idx}
										className={`
                            w-8 h-8 flex items-center justify-center rounded font-bold text-white text-sm
                            ${result === "W" ? "bg-green-500" : result === "L" ? "bg-red-500" : "bg-gray-400"}
                        `}
									>
										{result}
									</div>
								))}
							</div>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
};
