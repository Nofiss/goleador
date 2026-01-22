import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Edit,
	Link,
	Loader2,
	Plus,
	Shield,
	ShieldAlert,
	Trash2,
	UserCog,
	User as UserIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { deleteUser, getUsers } from "@/api/users";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { LinkPlayerDialog } from "@/features/users/LinkPlayerDialog";
import { UserFormDialog } from "@/features/users/UserFormDialog";
import { UserRolesDialog } from "@/features/users/UserRolesDialog";
import type { User } from "@/types";

export const UsersPage = () => {
	const queryClient = useQueryClient();
	const { data: users, isLoading } = useQuery({ queryKey: ["users"], queryFn: getUsers });
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [linkingUser, setLinkingUser] = useState<User | null>(null);
	const [userFormState, setUserFormState] = useState<{ isOpen: boolean; user: User | null }>({
		isOpen: false,
		user: null,
	});
	const [userToDelete, setUserToDelete] = useState<User | null>(null);

	const deleteMutation = useMutation({
		mutationFn: (userId: string) => deleteUser(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success("Utente eliminato");
			setUserToDelete(null);
		},
		onError: (err: unknown) => {
			const error = err as { response?: { data?: { detail?: string } } };
			toast.error(error.response?.data?.detail || "Errore eliminazione utente");
		},
	});

	const getRoleBadge = (roles: string[]) => {
		return (
			<div className="flex flex-wrap gap-1.5">
				{roles.includes("Admin") && (
					<Badge
						variant="outline"
						className="bg-destructive/10 text-destructive border-destructive/20 gap-1 px-2 py-0.5"
					>
						<ShieldAlert className="w-3 h-3" /> Admin
					</Badge>
				)}
				{roles.includes("Referee") && (
					<Badge
						variant="outline"
						className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 px-2 py-0.5"
					>
						<Shield className="w-3 h-3" /> Referee
					</Badge>
				)}
				{roles.length === 0 && (
					<Badge variant="secondary" className="font-normal opacity-70">
						User
					</Badge>
				)}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-3xl font-bold tracking-tight text-foreground">Utenti e Permessi</h1>
					<p className="text-muted-foreground">
						Visualizza gli utenti registrati e gestisci i loro privilegi di amministrazione.
					</p>
				</div>
				<Button className="gap-2" onClick={() => setUserFormState({ isOpen: true, user: null })}>
					<Plus className="h-4 w-4" /> Nuovo Utente
				</Button>
			</div>

			{/* Table Container */}
			<div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
				<Table>
					<TableHeader className="bg-muted/50">
						<TableRow>
							<TableHead className="font-bold text-foreground">Email</TableHead>
							<TableHead className="hidden md:table-cell">Username</TableHead>
							<TableHead>Giocatore Collegato</TableHead>
							<TableHead>Ruoli Attuali</TableHead>
							<TableHead className="text-right">Azioni</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={4} className="h-32 text-center">
									<div className="flex items-center justify-center gap-2 text-muted-foreground">
										<Loader2 className="h-5 w-5 animate-spin" />
										<span>Caricamento utenti...</span>
									</div>
								</TableCell>
							</TableRow>
						) : users?.length === 0 ? (
							<TableRow>
								<TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
									Nessun utente trovato.
								</TableCell>
							</TableRow>
						) : (
							users?.map((user) => (
								<TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
									<TableCell className="font-medium text-foreground">{user.email}</TableCell>
									<TableCell className="text-muted-foreground hidden md:table-cell">
										{user.username}
									</TableCell>
									<TableCell>
										{user.playerName ? (
											<span className="flex items-center gap-1 text-blue-600 font-medium">
												<UserIcon className="w-3 h-3" /> {user.playerName}
											</span>
										) : (
											<span className="text-gray-400 italic text-xs">Nessuno</span>
										)}
									</TableCell>

									<TableCell>{getRoleBadge(user.roles)}</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="outline"
												size="sm"
												className="h-8 gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
												onClick={() => setEditingUser(user)}
												title="Gestisci Ruoli"
											>
												<UserCog className="h-3.5 w-3.5" />
												<span className="hidden lg:inline">Ruoli</span>
											</Button>

											<Button
												variant="outline"
												size="sm"
												className="h-8"
												onClick={() => setUserFormState({ isOpen: true, user })}
												title="Modifica Utente"
											>
												<Edit className="h-3.5 w-3.5" />
											</Button>

											<Button
												variant="ghost"
												size="sm"
												className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
												onClick={() => setUserToDelete(user)}
												title="Elimina Utente"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>

											<Button
												variant="ghost"
												size="sm"
												className="h-8"
												onClick={() => setLinkingUser(user)}
												title="Collega a Giocatore"
											>
												<Link className="h-4 w-4" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<UserFormDialog
				user={userFormState.user}
				isOpen={userFormState.isOpen}
				onClose={() => setUserFormState({ isOpen: false, user: null })}
			/>
			<UserRolesDialog user={editingUser} onClose={() => setEditingUser(null)} />
			<LinkPlayerDialog user={linkingUser} onClose={() => setLinkingUser(null)} />

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Conferma Eliminazione</DialogTitle>
					</DialogHeader>
					<div className="py-4">
						Sei sicuro di voler eliminare l'utente <strong>{userToDelete?.email}</strong>? Questa
						azione non può essere annullata.
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setUserToDelete(null)}>
							Annulla
						</Button>
						<Button
							variant="destructive"
							onClick={() => userToDelete && deleteMutation.mutate(userToDelete.id)}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? "Eliminazione..." : "Elimina"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};
