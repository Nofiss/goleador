import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getTournaments } from "@/api/tournaments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { TournamentStatus } from "@/types";

export const TournamentsListPage = () => {
	const { data: tournaments, isLoading } = useQuery({
		queryKey: ["tournaments"],
		queryFn: getTournaments,
	});
	const { isAdmin } = useAuth();

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
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Tornei</h1>
					<p className="text-muted-foreground mt-1">
						Gestisci le competizioni aziendali.
					</p>
				</div>
				{isAdmin && (
					<Button asChild>
						<Link to="/tournaments/new">
							<Plus className="mr-2 h-4 w-4" /> Nuovo Torneo
						</Link>
					</Button>
				)}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{isLoading ? (
					<p>Caricamento...</p>
				) : (
					tournaments?.map((t) => (
						<Card key={t.id} className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start">
									<CardTitle className="text-lg">{t.name}</CardTitle>
									{getStatusBadge(t.status)}
								</div>
								<CardDescription>
									{t.teamSize} vs {t.teamSize} •{" "}
									{t.type === 0 ? "Girone" : "Eliminazione"}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" className="w-full" asChild>
									<Link to={`/tournaments/${t.id}`}>Dettagli</Link>
								</Button>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
};
