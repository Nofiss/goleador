import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayerList } from "@/features/players/PlayerList";
import { useAuth } from "@/hooks/useAuth";

export const PlayersListPage = () => {
	const { isAdmin } = useAuth();
	// Nota: La PlayerList che avevi fatto chiamava la query internamente.
	// Possiamo mantenerla così o passargli i dati. Per ora la usiamo come "Smart Component".

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">Giocatori</h1>
					<p className="text-muted-foreground mt-1">
						Gestisci la rosa aziendale e visualizza le statistiche.
					</p>
				</div>

				{isAdmin && (
					<Button asChild>
						<Link to="/players/new">
							<Plus className="mr-2 h-4 w-4" /> Nuovo Giocatore
						</Link>
					</Button>
				)}
			</div>

			<PlayerList />
		</div>
	);
};
