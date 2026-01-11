import { CreatePlayerForm } from "@/features/players/CreatePlayerForm";
import { PlayerList } from "@/features/players/PlayerList";
import { useQueryClient } from "@tanstack/react-query";

export const PlayersPage = () => {
  const queryClient = useQueryClient();

  const handlePlayerCreated = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Giocatori</h1>
      </div>
      
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        {/* Colonna Sinistra: Form (su schermi larghi occupa 1 colonna) */}
        <div className="lg:col-span-1">
            <CreatePlayerForm onSuccess={handlePlayerCreated} />
        </div>

        {/* Colonna Destra: Lista (su schermi larghi occupa 2 colonne) */}
        <div className="lg:col-span-2">
            <PlayerList />
        </div>
      </div>
    </div>
  );
};