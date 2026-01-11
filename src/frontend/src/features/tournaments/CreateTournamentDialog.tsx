import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTournament } from "@/api/tournaments";
import { TournamentType, type CreateTournamentRequest } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const CreateTournamentDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateTournamentRequest>({
    name: "",
    type: TournamentType.RoundRobin,
    teamSize: 1, // Default 1vs1
    hasReturnMatches: false
  });

  const mutation = useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      setOpen(false); // Chiudi modale
      setFormData({ ...formData, name: "" }); // Reset
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Nuovo Torneo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crea Torneo</DialogTitle>
          <DialogDescription>Configura le regole della competizione.</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Nome Torneo</Label>
            <Input 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Es. Champions League 2026"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Modalità</Label>
                <Select 
                    value={formData.type.toString()} 
                    onValueChange={(v) => setFormData({...formData, type: parseInt(v) as TournamentType})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TournamentType.RoundRobin.toString()}>Girone (Campionato)</SelectItem>
                    {/* Elimination non è ancora supportato dal backend scheduler, meglio nasconderlo o gestirlo */}
                    <SelectItem value={TournamentType.Elimination.toString()} disabled>Eliminazione (WIP)</SelectItem>
                  </SelectContent>
                </Select>
             </div>

             <div className="space-y-2">
                <Label>Formato</Label>
                 <Select 
                    value={formData.teamSize.toString()} 
                    onValueChange={(v) => setFormData({...formData, teamSize: parseInt(v)})}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 vs 1</SelectItem>
                    <SelectItem value="2">2 vs 2</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
             {/* Semplice checkbox HTML per rapidità, o usa Switch di shadcn */}
             <input 
                type="checkbox" 
                id="returnMatches"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={formData.hasReturnMatches}
                onChange={(e) => setFormData({...formData, hasReturnMatches: e.target.checked})}
             />
             <Label htmlFor="returnMatches">Andata e Ritorno</Label>
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creazione..." : "Crea Torneo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};