import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayers } from "@/api/players";
import { api } from "@/api/axios"; // Assumi di aver creato la funzione API registerPlayerToTournament
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, User } from "lucide-react";

export const PlayerPool = ({ tournamentId, registeredPlayers, assignedPlayerIds }: any) => {
  const queryClient = useQueryClient();
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  
  // Carica tutti i giocatori globali
  const { data: allPlayers } = useQuery({ queryKey: ["players"], queryFn: getPlayers });

  // Filtra quelli che NON sono ancora iscritti al torneo
  const availablePlayers = allPlayers?.filter(p => !registeredPlayers.some((rp: any) => rp.id === p.id)) || [];

  const mutation = useMutation({
    mutationFn: (playerId: string) => api.post(`/api/tournaments/${tournamentId}/register-player`, { playerId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
      setSelectedPlayerId("");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" /> Pool Iscritti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Aggiunta al Pool */}
        <div className="flex gap-2">
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona giocatore da iscrivere..." />
                </SelectTrigger>
                <SelectContent>
                    {availablePlayers.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.nickname}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button onClick={() => mutation.mutate(selectedPlayerId)} disabled={!selectedPlayerId || mutation.isPending}>
                Aggiungi
            </Button>
        </div>

        {/* Lista del Pool */}
        <div className="flex flex-wrap gap-2 pt-2">
            {registeredPlayers.length === 0 && <span className="text-sm text-gray-400">Nessun iscritto.</span>}
            
            {registeredPlayers.map((p: any) => {
                const isAssigned = assignedPlayerIds.includes(p.id);
                return (
                    <Badge 
                        key={p.id} 
                        variant={isAssigned ? "secondary" : "default"} // Grigio se già in squadra, Blu se libero
                        className={`flex items-center gap-1 px-3 py-1 ${isAssigned ? "opacity-50" : "hover:bg-blue-700"}`}
                    >
                        <User className="h-3 w-3" /> {p.nickname}
                    </Badge>
                );
            })}
        </div>
      </CardContent>
    </Card>
  );
};