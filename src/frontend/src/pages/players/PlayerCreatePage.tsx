import { ChevronLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreatePlayerForm } from "@/features/players/CreatePlayerForm";

export const PlayerCreatePage = () => {
	const navigate = useNavigate();

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="icon" asChild aria-label="Torna alla lista giocatori">
					<Link to="/players">
						<ChevronLeft className="h-5 w-5" />
					</Link>
				</Button>
				<h1 className="text-2xl font-bold tracking-tight">Registra Nuovo Giocatore</h1>
			</div>

			{/* Passiamo una callback per tornare alla lista dopo il salvataggio */}
			<CreatePlayerForm onSuccess={() => navigate("/players")} />
		</div>
	);
};
