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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export const CreateTournamentDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CreateTournamentRequest>({
    name: "",
    type: TournamentType.RoundRobin,
    teamSize: 1, // Default 1vs1
    hasReturnMatches: false,
        notes: "",
    pointsForWin: 3,
    pointsForDraw: 1,
    pointsForLoss: 0,
    goalThreshold: undefined, // undefined manda null al backend
    goalThresholdBonus: 0,
    enableTenZeroBonus: false,
    tenZeroBonus: 0
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

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

            <div className="space-y-2">
              <Label>Note (Opzionale)</Label>
              <Textarea 
                  placeholder="Regole speciali, premi in palio..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
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

          <div className="border-t pt-4">
            <Button type="button" variant="ghost" className="w-full text-sm text-gray-500" onClick={() => setShowAdvanced(!showAdvanced)}>
                {showAdvanced ? "Nascondi Regole Punteggio" : "Configura Punteggi Personalizzati"}
            </Button>

            {showAdvanced && (
                <div className="space-y-4 mt-4 bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label className="text-xs">Vittoria</Label>
                            <Input type="number" value={formData.pointsForWin} onChange={e => setFormData({...formData, pointsForWin: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <Label className="text-xs">Pareggio</Label>
                            <Input type="number" value={formData.pointsForDraw} onChange={e => setFormData({...formData, pointsForDraw: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <Label className="text-xs">Sconfitta</Label>
                            <Input type="number" value={formData.pointsForLoss} onChange={e => setFormData({...formData, pointsForLoss: parseInt(e.target.value)})} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Bonus Goal</Label>
                        <div className="flex gap-2 items-center">
                            <span className="text-sm">Se segnati &ge;</span>
                            <Input className="w-16" type="number" placeholder="4" 
                                value={formData.goalThreshold || ''} 
                                onChange={e => setFormData({...formData, goalThreshold: e.target.value ? parseInt(e.target.value) : undefined})} 
                            />
                            <span className="text-sm">goal, +</span>
                            <Input className="w-16" type="number" 
                                value={formData.goalThresholdBonus} 
                                onChange={e => setFormData({...formData, goalThresholdBonus: parseInt(e.target.value)})} 
                            />
                            <span className="text-sm">punti.</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="tenZero"
                            checked={formData.enableTenZeroBonus}
                            onCheckedChange={(c) => setFormData({...formData, enableTenZeroBonus: !!c})}
                        />
                        <Label htmlFor="tenZero">Bonus 10-0 (Cappotto)</Label>
                    </div>
                    {formData.enableTenZeroBonus && (
                        <div className="flex gap-2 items-center ml-6">
                            <span className="text-sm">Punti Extra:</span>
                            <Input className="w-16" type="number" value={formData.tenZeroBonus} onChange={e => setFormData({...formData, tenZeroBonus: parseInt(e.target.value)})} />
                        </div>
                    )}
                </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Creazione..." : "Crea Torneo"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};