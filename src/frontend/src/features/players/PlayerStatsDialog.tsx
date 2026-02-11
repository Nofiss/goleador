import { useQuery } from "@tanstack/react-query";
import { Activity, ShieldAlert, Trophy } from "lucide-react";
import { getPlayerStatistics } from "@/api/players";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PlayerStatsDialogProps {
	playerId: string | null;
	onClose: () => void;
}

export const PlayerStatsDialog = ({ playerId, onClose }: PlayerStatsDialogProps) => {
	const { data: stats, isLoading } = useQuery({
		queryKey: ["playerStats", playerId],
		queryFn: () => getPlayerStatistics(playerId as string),
		enabled: !!playerId, // Esegui solo se ID è presente
	});

	return (
		<Dialog open={!!playerId} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="text-2xl font-bold text-center text-primary">
						{isLoading ? <Skeleton className="h-8 w-32 mx-auto" /> : stats?.nickname}
					</DialogTitle>
					<DialogDescription className="text-center">
						Statistiche dettagliate del giocatore
					</DialogDescription>
				</DialogHeader>

				{isLoading ? (
					<div className="space-y-6 py-4">
						<div className="flex flex-col items-center">
							<Skeleton className="w-24 h-24 rounded-full" />
							<Skeleton className="h-4 w-16 mt-2" />
						</div>
						<div className="grid grid-cols-3 gap-4">
							<Skeleton className="h-20 rounded-lg" />
							<Skeleton className="h-20 rounded-lg" />
							<Skeleton className="h-20 rounded-lg" />
						</div>
						<Separator />
						<div className="flex justify-between px-4">
							<Skeleton className="h-10 w-24" />
							<Skeleton className="h-10 w-24" />
						</div>
						<Skeleton className="h-24 w-full rounded-lg" />
					</div>
				) : (
					stats && (
						<div className="space-y-6 py-4">
							{/* Win Rate Circle (simulato con CSS) */}
							<div className="flex flex-col items-center">
								<div
									className="relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary/20 bg-primary/5"
									role="progressbar"
									aria-valuenow={stats.winRate}
									aria-valuemin={0}
									aria-valuemax={100}
									aria-label={`Percentuale di vittorie: ${stats.winRate}%`}
								>
									<span className="text-xl font-bold text-primary">{stats.winRate}%</span>
								</div>
								<span className="text-sm text-muted-foreground mt-2 font-medium">Win Rate</span>
							</div>

							<div className="grid grid-cols-3 gap-4 text-center">
								<div
									className="p-3 bg-emerald-500/10 rounded-lg"
									role="img"
									aria-label={`Vittorie: ${stats.wins}`}
								>
									<div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
										{stats.wins}
									</div>
									<div className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold uppercase">
										Vittorie
									</div>
								</div>
								<div
									className="p-3 bg-muted rounded-lg"
									role="img"
									aria-label={`Pareggi: ${stats.draws}`}
								>
									<div className="text-2xl font-bold text-foreground">{stats.draws}</div>
									<div className="text-xs text-muted-foreground font-semibold uppercase">
										Pareggi
									</div>
								</div>
								<div
									className="p-3 bg-destructive/10 rounded-lg"
									role="img"
									aria-label={`Sconfitte: ${stats.losses}`}
								>
									<div className="text-2xl font-bold text-destructive">{stats.losses}</div>
									<div className="text-xs text-destructive/80 font-semibold uppercase">
										Sconfitte
									</div>
								</div>
							</div>

							<Separator />

							<div className="flex justify-between items-center px-4">
								<div className="flex items-center gap-2">
									<Trophy className="h-5 w-5 text-yellow-500" aria-hidden="true" />
									<div>
										<span className="block text-sm text-muted-foreground">Goal Fatti</span>
										<span className="font-bold text-lg">{stats.goalsFor}</span>
									</div>
								</div>
								<div className="flex items-center gap-2">
									<ShieldAlert className="h-5 w-5 text-red-500" aria-hidden="true" />
									<div>
										<span className="block text-sm text-muted-foreground">Goal Subiti</span>
										<span className="font-bold text-lg">{stats.goalsAgainst}</span>
									</div>
								</div>
							</div>

							<div className="bg-secondary p-4 rounded-lg">
								<div className="flex items-center gap-2 mb-2">
									<Activity className="h-4 w-4 text-muted-foreground/70" aria-hidden="true" />
									<span className="text-xs font-semibold uppercase text-muted-foreground">
										Forma Recente
									</span>
								</div>
								<div className="flex gap-2">
									{stats.recentForm.length === 0 && (
										<span className="text-sm text-muted-foreground/70">
											Nessuna partita recente
										</span>
									)}
									{stats.recentForm.map((result, idx) => {
										const label =
											result === "W" ? "Vittoria" : result === "L" ? "Sconfitta" : "Pareggio";
										return (
											<div
												// biome-ignore lint/suspicious/noArrayIndexKey: recent form is a short stable list
												key={idx}
												role="img"
												aria-label={label}
												title={label}
												className={cn(
													"w-8 h-8 flex items-center justify-center rounded font-bold text-white text-sm transition-transform hover:scale-110 cursor-default",
													result === "W"
														? "bg-green-500"
														: result === "L"
															? "bg-red-500"
															: "bg-gray-400",
												)}
											>
												{result}
											</div>
										);
									})}
								</div>
							</div>
						</div>
					)
				)}
			</DialogContent>
		</Dialog>
	);
};
