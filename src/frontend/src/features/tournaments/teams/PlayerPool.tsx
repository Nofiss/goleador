import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, User, UserCheck, UserPlus, Users2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getPlayers } from "@/api/players";
import { registerPlayer } from "@/api/tournaments"; // Assumendo esista un'api per rimuovere
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
    const [searchQuery, setSearchQuery] = useState("");

    const { data: allPlayers } = useQuery({ queryKey: ["players"], queryFn: getPlayers });

    // Statistiche veloci
    const stats = {
        total: registeredPlayers.length,
        assigned: assignedPlayerIds.length,
        free: registeredPlayers.length - assignedPlayerIds.length,
    };

    // Filtro per aggiungere nuovi giocatori (escludi chi è già nel pool)
    const availableToEnroll = useMemo(
        () => allPlayers?.filter((p) => !registeredPlayers.some((rp) => rp.id === p.id)) || [],
        [allPlayers, registeredPlayers],
    );

    // Filtro per la visualizzazione dei badge
    const filteredPlayers = registeredPlayers.filter((p) =>
        p.nickname.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const enrollMutation = useMutation({
        mutationFn: registerPlayer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
            setSelectedPlayerId("");
        },
    });

    return (
        <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Users2 className="h-5 w-5 text-primary" />
                        Pool Partecipanti
                    </CardTitle>

                    {/* Mini Stats Pill */}
                    <div className="flex gap-2">
                        <Badge variant="secondary" className="bg-background border-primary/20 text-primary">
                            {stats.total} Iscritti
                        </Badge>
                        <Badge variant="secondary" className="bg-background border-green-500/20 text-green-600">
                            {stats.free} Liberi
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {/* 1. SEZIONE AGGIUNTA (Top Bar) */}
                <div className="p-4 border-b bg-muted/10 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                            <SelectTrigger className="w-full bg-background">
                                <SelectValue placeholder="Iscrivi un giocatore dal database..." />
                            </SelectTrigger>
                            <SelectContent>
                                {availableToEnroll.length === 0 ? (
                                    <p className="p-2 text-xs text-center text-muted-foreground">
                                        Tutti i giocatori sono già iscritti
                                    </p>
                                ) : (
                                    availableToEnroll.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.nickname}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={() => enrollMutation.mutate({ tournamentId, playerId: selectedPlayerId })}
                        disabled={!selectedPlayerId || enrollMutation.isPending}
                        className="shrink-0"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Iscrivi
                    </Button>
                </div>

                {/* 2. AREA LISTA CON FILTRO */}
                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Cerca tra gli iscritti..."
                            className="pl-9 bg-muted/20 border-none h-9 text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 min-h-10">
                        {registeredPlayers.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic w-full text-center py-4">
                                Nessun giocatore nel pool. Inizia ad aggiungerne uno sopra.
                            </p>
                        ) : (
                            filteredPlayers.map((p) => {
                                const isAssigned = assignedPlayerIds.includes(p.id);
                                return (
                                    <Badge
                                        key={p.id}
                                        variant="outline"
                                        className={cn(
                                            "pl-1 pr-1 py-1 gap-1.5 transition-all border group",
                                            isAssigned
                                                ? "bg-muted/50 text-muted-foreground border-transparent opacity-70"
                                                : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                                                isAssigned
                                                    ? "bg-muted-foreground/20"
                                                    : "bg-primary text-primary-foreground shadow-sm",
                                            )}
                                        >
                                            <User className="h-3 w-3" />
                                        </div>

                                        <span className="font-semibold text-xs">{p.nickname}</span>

                                        {/* {isAssigned ? (
                                            <UserCheck className="h-3 w-3 mr-1 opacity-50" />
                                        ) : (
                                            // Bottone per rimuovere dal pool (opzionale, solo se admin e non in team)
                                            <Button
                                                className="hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5 transition-colors opacity-0 group-hover:opacity-100"
                                                title="Rimuovi dal pool"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        )} */}
                                    </Badge>
                                );
                            })
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
