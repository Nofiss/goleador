import { useQuery } from "@tanstack/react-query";
import { getTournamentStandings } from "@/api/tournaments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const StandingsTable = ({ tournamentId }: { tournamentId: string }) => {
  const { data: standings, isLoading } = useQuery({
    queryKey: ["standings", tournamentId],
    queryFn: () => getTournamentStandings(tournamentId),
  });

  if (isLoading) return <div className="text-center p-4">Caricamento classifica...</div>;

  return (
    <div className="border rounded-md bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[50px]">Pos</TableHead>
            <TableHead>Squadra</TableHead>
            <TableHead className="text-center font-bold">PT</TableHead>
            <TableHead className="text-center text-gray-500">G</TableHead>
            <TableHead className="text-center hidden md:table-cell">V</TableHead>
            <TableHead className="text-center hidden md:table-cell">N</TableHead>
            <TableHead className="text-center hidden md:table-cell">P</TableHead>
            <TableHead className="text-center hidden sm:table-cell">GF</TableHead>
            <TableHead className="text-center hidden sm:table-cell">GS</TableHead>
            <TableHead className="text-center">DR</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {standings?.length === 0 ? (
             <TableRow><TableCell colSpan={10} className="text-center h-24">Nessuna partita giocata</TableCell></TableRow>
          ) : (
            standings?.map((row, index) => (
            <TableRow key={row.teamId} className={cn(index === 0 && "bg-yellow-50/50")}>
              <TableCell className="font-medium">
                <div className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                    index === 0 ? "bg-yellow-400 text-yellow-900" : 
                    index === 1 ? "bg-gray-300 text-gray-800" :
                    index === 2 ? "bg-orange-300 text-orange-900" : "bg-gray-100 text-gray-500"
                )}>
                    {row.position}
                </div>
              </TableCell>
              <TableCell className="font-semibold">{row.teamName}</TableCell>
              <TableCell className="text-center font-bold text-lg">{row.points}</TableCell>
              <TableCell className="text-center text-gray-600">{row.played}</TableCell>
              <TableCell className="text-center hidden md:table-cell text-green-600">{row.won}</TableCell>
              <TableCell className="text-center hidden md:table-cell text-gray-400">{row.drawn}</TableCell>
              <TableCell className="text-center hidden md:table-cell text-red-400">{row.lost}</TableCell>
              <TableCell className="text-center hidden sm:table-cell">{row.goalsFor}</TableCell>
              <TableCell className="text-center hidden sm:table-cell">{row.goalsAgainst}</TableCell>
              <TableCell className="text-center font-mono text-sm">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </TableCell>
            </TableRow>
          )))}
        </TableBody>
      </Table>
    </div>
  );
};
