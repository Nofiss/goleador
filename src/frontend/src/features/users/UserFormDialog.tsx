import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { createUser, updateUser } from "@/api/users";
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
import type { User } from "@/types";

const userSchema = z.object({
	email: z.string().email("Inserisci un indirizzo email valido"),
	username: z.string().min(3, "Lo username deve avere almeno 3 caratteri"),
	password: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface Props {
	user: User | null;
	isOpen: boolean;
	onClose: () => void;
}

export const UserFormDialog = ({ user, isOpen, onClose }: Props) => {
	const queryClient = useQueryClient();
	const isEdit = !!user;

	const schema = isEdit
		? userSchema
		: userSchema.extend({
				password: z.string().min(6, "La password deve avere almeno 6 caratteri"),
			});

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<UserFormValues>({
		resolver: zodResolver(schema),
	});

	useEffect(() => {
		if (isOpen) {
			if (user) {
				reset({
					email: user.email,
					username: user.username,
					password: "",
				});
			} else {
				reset({
					email: "",
					username: "",
					password: "",
				});
			}
		}
	}, [user, isOpen, reset]);

	const mutation = useMutation({
		mutationFn: (data: UserFormValues) => {
			if (isEdit && user) {
				return updateUser(user.id, { email: data.email, username: data.username });
			}
			return createUser(data as Required<UserFormValues>);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["users"] });
			toast.success(isEdit ? "Utente aggiornato" : "Utente creato");
			onClose();
		},
		onError: (err: unknown) => {
			const error = err as { response?: { data?: { detail?: string } } };
			toast.error(error.response?.data?.detail || "Errore durante l'operazione");
		},
	});

	const onSubmit = (data: UserFormValues) => {
		mutation.mutate(data);
	};

	return (
		<Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Modifica Utente" : "Nuovo Utente"}</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input id="email" {...register("email")} />
						{errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
					</div>

					<div className="space-y-2">
						<Label htmlFor="username">Username</Label>
						<Input id="username" {...register("username")} />
						{errors.username && (
							<p className="text-sm text-destructive">{errors.username.message}</p>
						)}
					</div>

					{!isEdit && (
						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" {...register("password")} />
							{errors.password && (
								<p className="text-sm text-destructive">{errors.password.message}</p>
							)}
						</div>
					)}

					<DialogFooter className="pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Annulla
						</Button>
						<Button type="submit" disabled={mutation.isPending}>
							{isEdit ? "Salva Modifiche" : "Crea Utente"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
