import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreateTournamentForm } from "@/features/tournaments/CreateTournamentForm";

export const TournamentCreatePage = () => {
	const navigate = useNavigate();

	return (
		<div className="max-w-3xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/tournaments">
						<ChevronLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Crea Nuovo Torneo
					</h1>
					<p className="text-muted-foreground text-sm">
						Configura le regole, i punteggi e il formato.
					</p>
				</div>
			</div>

			<CreateTournamentForm onSuccess={() => navigate("/tournaments")} />
		</div>
	);
};
