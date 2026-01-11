import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getTournaments } from "@/api/tournaments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CreateTournamentDialog } from "@/features/tournaments/CreateTournamentDialog";
import { useAuth } from "@/hooks/useAuth";
import { TournamentStatus, TournamentType } from "@/types";

export const TournamentsPage = () => {
	const { isAdmin } = useAuth();

	const { data: tournaments, isLoading } = useQuery({
		queryKey: ["tournaments"],
		queryFn: getTournaments,
	});

	const getStatusBadge = (status: TournamentStatus) => {
		switch (status) {
			case TournamentStatus.Setup:
				return <Badge variant="secondary">Iscrizioni</Badge>;
			case TournamentStatus.Active:
				return (
					<Badge className="bg-green-600 hover:bg-green-700">In Corso</Badge>
				);
			case TournamentStatus.Finished:
				return <Badge variant="outline">Concluso</Badge>;
			default:
				return null;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Tornei</h1>
					<p className="text-gray-500">Gestisci le competizioni aziendali.</p>
				</div>
				{/* Solo admin crea tornei */}
				{isAdmin && <CreateTournamentDialog />}
			</div>

			<div className="rounded-md border bg-white shadow-sm">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nome</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Formato</TableHead>
							<TableHead>Stato</TableHead>
							<TableHead className="text-right">Azioni</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center h-24">
									Caricamento...
								</TableCell>
							</TableRow>
						) : tournaments?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center h-24">
									Nessun torneo trovato.
								</TableCell>
							</TableRow>
						) : (
							tournaments?.map((t) => (
								<TableRow key={t.id}>
									<TableCell className="font-medium">{t.name}</TableCell>
									<TableCell>
										{t.type === TournamentType.RoundRobin
											? "Girone"
											: "Eliminazione"}
									</TableCell>
									<TableCell>
										{t.teamSize === 1 ? "1 vs 1" : "2 vs 2"}
									</TableCell>
									<TableCell>{getStatusBadge(t.status)}</TableCell>
									<TableCell className="text-right">
										<Button variant="ghost" size="sm" asChild>
											<Link to={`/tournaments/${t.id}`}>
												Dettagli <ArrowRight className="ml-2 h-4 w-4" />
											</Link>
										</Button>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
};
