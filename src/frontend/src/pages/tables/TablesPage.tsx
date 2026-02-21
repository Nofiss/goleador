import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MapIcon, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTable, getTables } from "@/api/tables";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { CreateTableDialog } from "@/features/tables/CreateTableDialog";
import { useAuth } from "@/hooks/useAuth";

export const TablesPage = () => {
	const { isAdmin } = useAuth();
	const queryClient = useQueryClient();

	const { data: tables, isLoading } = useQuery({
		queryKey: ["tables"],
		queryFn: getTables,
	});

	const deleteMutation = useMutation({
		mutationFn: deleteTable,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tables"] });
			toast.success("Tavolo eliminato");
		},
		onError: () => toast.error("Impossibile eliminare: il tavolo è usato in alcune partite."),
	});

	if (isLoading) return <div>Caricamento...</div>;

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center border-b pb-4">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Tavoli</h1>
					<p className="text-muted-foreground">Gestisci le postazioni di gioco.</p>
				</div>
				{isAdmin && <CreateTableDialog />}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{tables?.length === 0 ? (
					<EmptyState
						icon={MapIcon}
						title="Nessun tavolo trovato"
						description="Configura i tavoli da gioco per iniziare a registrare le partite."
						className="col-span-full py-20"
					/>
				) : (
					tables?.map((table) => (
						<Card key={table.id}>
							<CardHeader className="pb-2">
								<CardTitle>{table.name}</CardTitle>
								<CardDescription className="flex items-center gap-1">
									<MapPin className="h-3 w-3" /> {table.location}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="flex justify-between items-center mt-2">
									<span
										className={`text-xs px-2 py-1 rounded ${table.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
									>
										{table.isActive ? "Attivo" : "Fuori Servizio"}
									</span>

									{isAdmin && (
										<Button
											variant="ghost"
											size="icon"
											className="text-red-500 hover:text-red-700 hover:bg-red-50"
											onClick={() => {
												if (confirm("Sei sicuro?")) deleteMutation.mutate(table.id);
											}}
											aria-label="Elimina tavolo"
											title="Elimina tavolo"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									)}
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
};
