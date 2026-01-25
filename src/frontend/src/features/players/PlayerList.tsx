import { useQuery } from "@tanstack/react-query";
import { BarChart2, RefreshCcw, User } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { getPlayers } from "@/api/players";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { PlayerStatsDialog } from "@/features/players/PlayerStatsDialog";
import { cn } from "@/lib/utils";
import type { Player } from "@/types";

/**
 * Componente per la riga del giocatore, ottimizzato con React.memo.
 * Previene re-render non necessari quando cambia lo stato globale di PlayerList (es. selectedPlayerId).
 */
const PlayerRow = memo(
	({ player, onShowStats }: { player: Player; onShowStats: (id: string) => void }) => {
		return (
			<TableRow className="hover:bg-muted/30 transition-colors group">
				<TableCell className="font-bold text-primary">
					<div className="flex items-center gap-2">
						<div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
							<User className="h-3.5 w-3.5 text-primary" />
						</div>
						{player.nickname}
					</div>
				</TableCell>
				<TableCell className="hidden md:table-cell text-foreground/80">{player.fullName}</TableCell>
				<TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
					{player.email}
				</TableCell>
				<TableCell className="text-right font-mono text-xs text-muted-foreground">
					{new Date(player.createdAt).toLocaleDateString("it-IT")}
				</TableCell>
				<TableCell className="text-right">
					<Button
						variant="secondary"
						size="sm"
						className="h-8 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
						onClick={() => onShowStats(player.id)}
						aria-label={`Visualizza statistiche di ${player.nickname}`}
					>
						<BarChart2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
						<span className="text-xs">Stats</span>
					</Button>
				</TableCell>
			</TableRow>
		);
	},
);

PlayerRow.displayName = "PlayerRow";

export const PlayerList = () => {
	const {
		data: players,
		isLoading,
		isError,
		refetch,
		isFetching,
	} = useQuery({
		queryKey: ["players"],
		queryFn: getPlayers, // Ottimizzato: passata direttamente la funzione
	});

	const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

	// Ottimizzato: useCallback per mantenere l'identità della funzione stabile e permettere a memo di funzionare
	const handleShowStats = useCallback((id: string) => {
		setSelectedPlayerId(id);
	}, []);

	if (isLoading)
		return (
			<div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-card rounded-xl border border-border shadow-sm">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
					<div className="space-y-2">
						<Skeleton className="h-8 w-48" />
						<Skeleton className="h-4 w-64" />
					</div>
					<Skeleton className="h-9 w-28" />
				</div>

				<div className="rounded-lg border border-border overflow-hidden bg-background/30">
					<Table>
						<TableHeader className="bg-muted/50">
							<TableRow>
								<TableHead className="font-bold text-foreground">Nickname</TableHead>
								<TableHead className="hidden md:table-cell">Nome Completo</TableHead>
								<TableHead className="hidden sm:table-cell">Email</TableHead>
								<TableHead className="text-right">Iscritto il</TableHead>
								<TableHead className="w-20" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{Array.from({ length: 6 }).map((_, i) => (
								<TableRow
									// biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static
									key={i}
								>
									<TableCell>
										<div className="flex items-center gap-2">
											<Skeleton className="h-7 w-7 rounded-full" />
											<Skeleton className="h-4 w-24" />
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<Skeleton className="h-4 w-32" />
									</TableCell>
									<TableCell className="hidden sm:table-cell">
										<Skeleton className="h-4 w-48" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="h-4 w-20 ml-auto" />
									</TableCell>
									<TableCell className="text-right">
										<Skeleton className="h-8 w-16 ml-auto" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</div>
		);

	if (isError)
		return (
			<div className="text-center p-12 border-2 border-dashed border-destructive/20 rounded-xl bg-destructive/5 text-destructive">
				<p className="font-semibold">Errore nel caricamento dei dati.</p>
				<Button variant="ghost" className="mt-4" onClick={() => refetch()}>
					Riprova
				</Button>
			</div>
		);

	return (
		<>
			<div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-card rounded-xl border border-border shadow-sm">
				{/* Header */}
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
					<div>
						<h2 className="text-2xl font-bold tracking-tight text-foreground">Rosa Giocatori</h2>
						<p className="text-sm text-muted-foreground">
							Gestisci i {players?.length || 0} atleti registrati in piattaforma.
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						disabled={isFetching}
						className="bg-background/50 backdrop-blur-sm"
					>
						<RefreshCcw className={cn("mr-2 h-4 w-4", isFetching && "animate-spin")} />
						{isFetching ? "Aggiornamento..." : "Aggiorna"}
					</Button>
				</div>

				{/* Tabella */}
				<div className="rounded-lg border border-border overflow-hidden bg-background/30">
					<Table>
						<TableHeader className="bg-muted/50">
							<TableRow>
								<TableHead className="font-bold text-foreground">Nickname</TableHead>
								<TableHead className="hidden md:table-cell">Nome Completo</TableHead>
								<TableHead className="hidden sm:table-cell">Email</TableHead>
								<TableHead className="text-right">Iscritto il</TableHead>
								<TableHead className="w-20" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{players?.length === 0 ? (
								<TableRow>
									<TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
										<div className="flex flex-col items-center gap-2">
											<User className="h-8 w-8 opacity-10" />
											<p>Nessun giocatore trovato.</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								players?.map((player) => (
									<PlayerRow key={player.id} player={player} onShowStats={handleShowStats} />
								))
							)}
						</TableBody>
					</Table>
				</div>
			</div>

			<PlayerStatsDialog playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />
		</>
	);
};
