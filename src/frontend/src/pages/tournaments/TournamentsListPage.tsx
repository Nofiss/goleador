import { useQuery } from "@tanstack/react-query";
import { Plus, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { getTournaments } from "@/api/tournaments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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
			case TournamentStatus.setup:
				return <Badge variant="secondary">Iscrizioni</Badge>;
			case TournamentStatus.active:
				return <Badge className="bg-green-600 hover:bg-green-700">In Corso</Badge>;
			case TournamentStatus.finished:
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
					<p className="text-muted-foreground mt-1">Gestisci le competizioni aziendali.</p>
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
					Array.from({ length: 6 }).map((_, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: Skeletons are static and won't change order
						<Card key={i}>
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start">
									<Skeleton className="h-6 w-32" />
									<Skeleton className="h-5 w-16 rounded-full" />
								</div>
								<Skeleton className="h-4 w-24 mt-2" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-9 w-full" />
							</CardContent>
						</Card>
					))
				) : tournaments?.length === 0 ? (
					<EmptyState
						className="col-span-full py-20"
						icon={Trophy}
						title="Nessun torneo trovato"
						description="Al momento non ci sono competizioni attive o in programma."
						action={
							isAdmin && (
								<Button asChild>
									<Link to="/tournaments/new">
										<Plus className="mr-2 h-4 w-4" /> Crea il primo torneo
									</Link>
								</Button>
							)
						}
					/>
				) : (
					tournaments?.map((t) => (
						<Card key={t.id} className="hover:shadow-md transition-shadow">
							<CardHeader className="pb-2">
								<div className="flex justify-between items-start">
									<CardTitle className="text-lg">{t.name}</CardTitle>
									{getStatusBadge(t.status)}
								</div>
								<CardDescription>
									{t.teamSize} vs {t.teamSize} • {t.type === 0 ? "Girone" : "Eliminazione"}
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
