import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTournamentById, startTournament } from "@/api/tournaments";
import { RegisterTeamForm } from "@/features/tournaments/RegisterTeamForm";
import { TournamentStatus } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PlayCircle, Trophy } from "lucide-react";
import { StandingsTable } from "@/features/tournaments/StandingsTable";

export const TournamentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => getTournamentById(id!),
    enabled: !!id,
  });

  const startMutation = useMutation({
    mutationFn: startTournament,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tournament", id] });
    }
  });

  if (isLoading || !tournament) return <div>Caricamento...</div>;

  return (
    <div className="space-y-6">
      {/* Header Torneo */}
      <div className="flex justify-between items-start border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {tournament.name}
            {tournament.status === TournamentStatus.Setup && <Badge variant="secondary">Iscrizioni</Badge>}
            {tournament.status === TournamentStatus.Active && <Badge className="bg-green-600">In Corso</Badge>}
          </h1>
          <p className="text-gray-500 mt-1">Formato: {tournament.teamSize} vs {tournament.teamSize}</p>
        </div>

        {tournament.notes && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="font-bold text-yellow-700">Note del Torneo</p>
            <p className="text-yellow-800">{tournament.notes}</p>
          </div>
        )}

        <div className="text-xs text-gray-500 mb-6 flex gap-4 flex-wrap">
          <span>🏆 Win: {tournament.scoringRules.pointsForWin}pt</span>
          <span>🤝 Draw: {tournament.scoringRules.pointsForDraw}pt</span>
          {tournament.scoringRules.goalThreshold && (
            <span className="bg-blue-50 px-2 py-0.5 rounded text-blue-700">
              ⚽ Bonus: +{tournament.scoringRules.goalThresholdBonus}pt se {tournament.scoringRules.goalThreshold}+ goal
            </span>
          )}
        {tournament.scoringRules.enableTenZeroBonus && (
          <span className="bg-red-50 px-2 py-0.5 rounded text-red-700">
              🔥 Cappotto (10-0): +{tournament.scoringRules.tenZeroBonus}pt
          </span>
         )}
      </div>

        {/* Bottone Start */}
        {tournament.status === TournamentStatus.Setup && (
            <Button 
                onClick={() => startMutation.mutate(tournament.id)} 
                disabled={tournament.teams.length < 2 || startMutation.isPending}
            >
                <PlayCircle className="mr-2 h-4 w-4" /> Avvia Torneo
            </Button>
        )}
      </div>

      <Tabs defaultValue={tournament.status === TournamentStatus.Active ? "matches" : "teams"}>
        <TabsList>
          <TabsTrigger value="standings">Classifica</TabsTrigger> 
          <TabsTrigger value="matches">Partite</TabsTrigger>
          <TabsTrigger value="teams">Squadre ({tournament.teams.length})</TabsTrigger>
        </TabsList>

        {/* TAB SQUADRE */}
        <TabsContent value="standings">
          {tournament.status === TournamentStatus.Setup ? (
            <div className="text-center py-10 text-gray-500 border rounded bg-gray-50">
                La classifica sarà disponibile dopo l'avvio del torneo.
            </div>
          ) : (
            <StandingsTable tournamentId={tournament.id} />
          )}
        </TabsContent>

        {/* TAB SQUADRE */}
        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-4 bg-white">
                <h3 className="font-bold mb-4">Squadre Iscritte</h3>
                {tournament.teams.length === 0 ? (
                    <p className="text-gray-400">Nessuna squadra iscritta.</p>
                ) : (
                    <ul className="space-y-2">
                        {tournament.teams.map(t => (
                            <li key={t.id} className="p-2 bg-gray-50 rounded border flex items-center gap-2">
                                <Trophy className="h-4 w-4 text-yellow-500" /> {t.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            
            {/* Mostra form solo se in setup */}
            {tournament.status === TournamentStatus.Setup && (
                <RegisterTeamForm tournamentId={tournament.id} />
            )}
          </div>
        </TabsContent>

        {/* TAB PARTITE */}
        <TabsContent value="matches">
          {tournament.status === TournamentStatus.Setup ? (
            <Alert>
              <AlertTitle>Torneo non iniziato</AlertTitle>
              <AlertDescription>Avvia il torneo per generare il calendario.</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tournament.matches.map(match => (
                    <div key={match.id} className="border rounded-lg p-4 bg-white shadow-sm flex flex-col items-center">
                        <div className="text-sm text-gray-500 mb-2">Partita Girone</div>
                        <div className="flex justify-between w-full font-bold text-lg mb-4">
                            <span>Casa</span>
                            <span className="text-gray-300">vs</span>
                            <span>Ospite</span>
                        </div>
                        {match.status === 0 ? (
                             <Button variant="outline" size="sm">Gioca</Button>
                        ) : (
                             <div className="text-2xl font-mono">{match.scoreHome} - {match.scoreAway}</div>
                        )}
                    </div>
                ))}
                {tournament.matches.length === 0 && <p>Nessuna partita generata.</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};