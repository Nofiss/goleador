import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, UserPlus } from "lucide-react";
import { useState } from "react";
import { getPlayers } from "@/api/players";
import { registerPlayer } from "@/api/tournaments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { TournamentTeamPlayer } from "@/types";

interface PlayerPoolProps {
    tournamentId: string;
    registeredPlayers: TournamentTeamPlayer[];
    assignedPlayerIds: string[];
}

export const PlayerPool = ({
    tournamentId,
    registeredPlayers,
    assignedPlayerIds,
}: PlayerPoolProps) => {
    const queryClient = useQueryClient();
    const [selectedPlayerId, setSelectedPlayerId] = useState("");

    const { data: allPlayers } = useQuery({ queryKey: ["players"], queryFn: getPlayers });

    const availableToEnroll =
        allPlayers?.filter((p) => !registeredPlayers.some((rp: any) => rp.id === p.id)) || [];

    const mutation = useMutation({
        mutationFn: registerPlayer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
            setSelectedPlayerId("");
        },
    });

    return (
        <Card className="border-primary/20 bg-linear-to-br from-card to-muted/30">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <UserPlus className="h-5 w-5 text-blue-500" />
                    </div>
                    Pool Giocatori Iscritti
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3">
                    <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                        <SelectTrigger className="w-full bg-background/50">
                            <SelectValue placeholder="Seleziona un giocatore dal database..." />
                        </SelectTrigger>
                        <SelectContent>
                            {availableToEnroll.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.nickname}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={() => mutation.mutate({ tournamentId, playerId: selectedPlayerId })}
                        disabled={!selectedPlayerId || mutation.isPending}
                        className="shrink-0 shadow-sm"
                    >
                        Iscrivi al Torneo
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {registeredPlayers.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                            Nessun giocatore iscritto nel pool.
                        </p>
                    ) : (
                        registeredPlayers.map((p: any) => {
                            const isAssigned = assignedPlayerIds.includes(p.id);
                            return (
                                <Badge
                                    key={p.id}
                                    variant="outline"
                                    className={cn(
                                        "pl-1 pr-2 py-1 gap-1.5 transition-all border-2",
                                        isAssigned
                                            ? "bg-muted/50 text-muted-foreground border-transparent opacity-60"
                                            : "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 hover:bg-blue-500/20",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "h-5 w-5 rounded-full flex items-center justify-center",
                                            isAssigned ? "bg-muted-foreground/20" : "bg-blue-500 text-white",
                                        )}
                                    >
                                        <User className="h-3 w-3" />
                                    </div>
                                    <span className="font-semibold">{p.nickname}</span>
                                    {isAssigned && (
                                        <span className="text-[10px] ml-1 uppercase font-bold opacity-70">
                                            (In Team)
                                        </span>
                                    )}
                                </Badge>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
