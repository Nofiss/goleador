import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateUserRoles } from "@/api/users";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { User } from "@/types";

interface Props {
	user: User | null;
	onClose: () => void;
}

const AVAILABLE_ROLES = ["Admin", "Referee"];

export const UserRolesDialog = ({ user, onClose }: Props) => {
	const queryClient = useQueryClient();
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

	useEffect(() => {
		if (user) setSelectedRoles(user.roles);
	}, [user]);

	const mutation = useMutation({
		mutationFn: () => updateUserRoles(user?.id as string, selectedRoles),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			onClose();
			toast.success("Ruoli aggiornati con successo");
		},
		onError: (err: unknown) => {
			const error = err as { response?: { data?: { detail?: string } } };
			toast.error(error.response?.data?.detail || "Errore aggiornamento ruoli");
		},
	});

	const toggleRole = (role: string) => {
		setSelectedRoles((prev) =>
			prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
		);
	};

	if (!user) return null;

	return (
		<Dialog open={!!user} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Gestione Ruoli</DialogTitle>
				</DialogHeader>

				<div className="py-4 space-y-4">
					<p className="text-sm text-gray-500">
						Modifica permessi per <strong>{user.username}</strong>
					</p>

					<div className="flex flex-col gap-3">
						{AVAILABLE_ROLES.map((role) => (
							<div key={role} className="flex items-center space-x-2">
								<Checkbox
									id={role}
									checked={selectedRoles.includes(role)}
									onCheckedChange={() => toggleRole(role)}
								/>
								<Label htmlFor={role}>{role}</Label>
							</div>
						))}
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Annulla
					</Button>
					<Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
						Salva Modifiche
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
