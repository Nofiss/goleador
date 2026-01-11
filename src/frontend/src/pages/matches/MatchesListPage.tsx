import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MatchesListTable } from "@/features/matches/MatchesListTable";
import { useAuth } from "@/hooks/useAuth";

export const MatchesListPage = () => {
	const { isAuthenticated } = useAuth();

	return (
		<div className="space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-foreground">
						Partite
					</h1>
					<p className="text-muted-foreground mt-1">
						Lo storico delle sfide amichevoli e di torneo.
					</p>
				</div>

				{isAuthenticated && (
					<Button asChild>
						<Link to="/matches/new">
							<Plus className="mr-2 h-4 w-4" /> Nuova Partita
						</Link>
					</Button>
				)}
			</div>

			<MatchesListTable />
		</div>
	);
};
