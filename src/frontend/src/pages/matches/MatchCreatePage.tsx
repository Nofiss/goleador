import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MatchCreateForm } from "@/features/matches/MatchCreateForm";

export const MatchCreatePage = () => {
	const navigate = useNavigate();

	return (
		<div className="max-w-4xl mx-auto space-y-8">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild>
					<Link to="/matches">
						<ChevronLeft className="h-5 w-5" />
					</Link>
				</Button>
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Registra Partita Rapida
					</h1>
					<p className="text-muted-foreground text-sm">
						Inserisci il risultato di un'amichevole 1 vs 1.
					</p>
				</div>
			</div>

			<MatchCreateForm onSuccess={() => navigate("/matches")} />
		</div>
	);
};
