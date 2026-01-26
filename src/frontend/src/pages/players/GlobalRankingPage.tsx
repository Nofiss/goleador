import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { getGlobalRanking } from "@/api/players";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

export const GlobalRankingPage = () => {
	const { data: ranking, isLoading } = useQuery({
		queryKey: ["global-ranking"],
		queryFn: getGlobalRanking,
	});

	if (isLoading) {
		return (
			<div className="space-y-4">
				<Skeleton className="h-10 w-64" />
				<Skeleton className="h-[400px] w-full" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Ranking Globale</h1>
				<p className="text-muted-foreground">
					Classifica basata sul sistema ELO (punteggio base 1200).
				</p>
			</div>

			<div className="rounded-md border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-16">Pos</TableHead>
							<TableHead>Giocatore</TableHead>
							<TableHead className="text-right">ELO Rating</TableHead>
							<TableHead className="text-right">Partite</TableHead>
							<TableHead className="text-right">Win Rate</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{ranking?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center">
									Nessun dato disponibile.
								</TableCell>
							</TableRow>
						) : (
							ranking?.map((player, index) => (
								<TableRow key={player.id}>
									<TableCell className="font-medium">
										<div className="flex items-center justify-center">
											{index < 3 ? (
												<>
													<span className="sr-only">{index + 1}° posto</span>
													<Trophy
														aria-hidden="true"
														className={`h-5 w-5 ${
															index === 0
																? "text-yellow-500"
																: index === 1
																	? "text-slate-400"
																	: "text-amber-600"
														}`}
													/>
												</>
											) : (
												<span className="text-muted-foreground">{index + 1}</span>
											)}
										</div>
									</TableCell>
									<TableCell className="font-semibold">{player.nickname}</TableCell>
									<TableCell className="text-right">
										<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
											{player.eloRating}
										</span>
									</TableCell>
									<TableCell className="text-right font-mono text-sm">
										{player.totalMatches}
									</TableCell>
									<TableCell className="text-right font-mono text-sm">{player.winRate}%</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
