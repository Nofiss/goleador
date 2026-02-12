import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { uploadTeamBranding } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TournamentTeam } from "@/types";

interface Props {
	team: TournamentTeam | null;
	tournamentId: string;
	onClose: () => void;
}

export const TeamBrandingDialog = ({ team, tournamentId, onClose }: Props) => {
	const queryClient = useQueryClient();
	const [logo, setLogo] = useState<File | null>(null);
	const [sponsor, setSponsor] = useState<File | null>(null);

	const getImageUrl = (url?: string) => {
		if (!url) return null;
		if (url.startsWith("http")) return url;
		const baseUrl = import.meta.env.VITE_API_URL || "";
		return `${baseUrl}${url}`;
	};

	const [logoPreview, setLogoPreview] = useState<string | null>(getImageUrl(team?.logoUrl));
	const [sponsorPreview, setSponsorPreview] = useState<string | null>(
		getImageUrl(team?.sponsorUrl),
	);

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setLogo(file);
			setLogoPreview(URL.createObjectURL(file));
		}
	};

	const handleSponsorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setSponsor(file);
			setSponsorPreview(URL.createObjectURL(file));
		}
	};

	const mutation = useMutation({
		mutationFn: async () => {
			if (!team) return;
			const formData = new FormData();
			if (logo) formData.append("logo", logo);
			if (sponsor) formData.append("sponsor", sponsor);
			return uploadTeamBranding(team.id, formData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournamentId] });
			toast.success("Branding aggiornato con successo!");
			onClose();
		},
		onError: (error: unknown) => {
			const message =
				error instanceof Error && "response" in error
					? (error as { response?: { data?: { message?: string } } }).response?.data?.message
					: "Errore durante il caricamento.";
			toast.error(message || "Errore durante il caricamento.");
		},
	});

	if (!team) return null;

	return (
		<Dialog open={!!team} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Personalizza Squadra: {team.name}</DialogTitle>
				</DialogHeader>
				<div className="space-y-6 py-4">
					<div className="space-y-4">
						<Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
							Logo della Squadra
						</Label>
						<div className="flex flex-col items-center gap-4">
							<div className="relative h-32 w-32 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/30">
								{logoPreview ? (
									<img
										src={logoPreview}
										alt="Logo preview"
										className="h-full w-full object-cover"
									/>
								) : (
									<ImagePlus className="h-8 w-8 text-muted-foreground/40" />
								)}
							</div>
							<Input
								type="file"
								accept="image/png, image/jpeg, image/webp"
								onChange={handleLogoChange}
								className="cursor-pointer"
							/>
						</div>
					</div>

					<div className="space-y-4">
						<Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
							Sponsor della Squadra
						</Label>
						<div className="flex flex-col items-center gap-4">
							<div className="relative h-24 w-full rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted/30">
								{sponsorPreview ? (
									<img
										src={sponsorPreview}
										alt="Sponsor preview"
										className="h-full w-full object-contain p-2"
									/>
								) : (
									<div className="text-xs text-muted-foreground/40 font-medium">
										NESSUNO SPONSOR
									</div>
								)}
							</div>
							<Input
								type="file"
								accept="image/png, image/jpeg, image/webp"
								onChange={handleSponsorChange}
								className="cursor-pointer"
							/>
						</div>
					</div>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<Button
						onClick={() => mutation.mutate()}
						disabled={mutation.isPending || (!logo && !sponsor)}
					>
						{mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Salva
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
