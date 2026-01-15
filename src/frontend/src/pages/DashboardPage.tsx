import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { getTournaments } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { TournamentStatus } from "@/types";

export const DashboardPage = () => {
	const { data: tournaments, isLoading } = useQuery({
		queryKey: ["tournaments"],
		queryFn: getTournaments,
	});

	const activeTournaments =
		tournaments?.filter((t) => t.status === TournamentStatus.Active) || [];
	const setupTournaments =
		tournaments?.filter((t) => t.status === TournamentStatus.Setup) || [];

	return (
		<div className="space-y-8">
			{/* Hero Section */}
			<section className="bg-linear-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 md:p-8 shadow-lg">
				<h1 className="text-3xl md:text-4xl font-extrabold mb-2">
					Benvenuto su Goleador ⚽
				</h1>
				<p className="text-blue-100 text-base md:text-lg max-w-2xl">
					Il gestionale definitivo per i tuoi tornei aziendali.
					Organizza sfide, traccia i risultati e scala la classifica!
				</p>

				{/* FIX RESPONSIVE: flex-col su mobile, flex-row su schermi sm+ */}
				<div className="mt-6 flex flex-col sm:flex-row gap-4">
					<Button
						asChild
						variant="secondary"
						size="lg"
						className="w-full sm:w-auto" // Full width su mobile
					>
						<Link to="/matches">Nuova Partita Rapida</Link>
					</Button>

					<Button
						asChild
						variant="outline"
						className="bg-transparent text-white border-white hover:bg-white/20 w-full sm:w-auto" // Full width su mobile
						size="lg"
					>
						<Link to="/tournaments">Vedi Tornei</Link>
					</Button>
				</div>
			</section>

			{/* Grid Widget */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Widget: Tornei in Corso */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="text-yellow-500" /> Tornei in Corso
						</CardTitle>
						<CardDescription>
							Competizioni attualmente attive in azienda.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{isLoading ? (
							<p>Caricamento...</p>
						) : activeTournaments.length === 0 ? (
							<div className="text-center py-6 text-gray-400">
								Nessun torneo attivo al momento.
							</div>
						) : (
							<div className="space-y-4">
								{activeTournaments.map((t) => (
									<div
										key={t.id}
										className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
									>
										<div>
											<h4 className="font-bold text-lg">{t.name}</h4>
											<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
												{t.teamSize} vs {t.teamSize}
											</span>
										</div>
										<Button size="sm" variant="outline" asChild>
											<Link to={`/tournaments/${t.id}`}>
												Vai <ArrowRight className="ml-1 h-3 w-3" />
											</Link>
										</Button>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>

				{/* Widget: Iscrizioni Aperte */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="text-blue-500" /> Iscrizioni Aperte
						</CardTitle>
						<CardDescription>
							Non perdere l'occasione di partecipare!
						</CardDescription>
					</CardHeader>
					<CardContent>
						{setupTournaments.length === 0 ? (
							<div className="text-center py-6 text-gray-400">
								Nessuna iscrizione aperta.
							</div>
						) : (
							<div className="space-y-4">
								{setupTournaments.map((t) => (
									<div
										key={t.id}
										className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
									>
										<h4 className="font-medium">{t.name}</h4>
										<Button size="sm" asChild>
											<Link to={`/tournaments/${t.id}`}>Iscriviti</Link>
										</Button>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
