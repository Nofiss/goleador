import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { setApiErrors } from "@/utils/formUtils";

const playerSchema = z.object({
	nickname: z.string().min(2, "Il nickname deve avere almeno 2 caratteri"),
	firstName: z.string().min(1, "Il nome è obbligatorio"),
	lastName: z.string().min(1, "Il cognome è obbligatorio"),
	email: z.string().email("Inserisci un indirizzo email valido"),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

interface CreatePlayerFormProps {
	onSuccess?: () => void;
}

interface ApiErrorData {
	errors?: Record<string, string[]>;
	detail?: string;
}

export const CreatePlayerForm = ({ onSuccess }: CreatePlayerFormProps) => {
	const form = useForm<PlayerFormValues>({
		resolver: zodResolver(playerSchema),
		defaultValues: {
			nickname: "",
			firstName: "",
			lastName: "",
			email: "",
		},
	});

	const mutation = useMutation({
		mutationFn: (newPlayer: PlayerFormValues) => {
			return api.post("/players", newPlayer);
		},
		onSuccess: () => {
			toast.success("Giocatore creato con successo!");
			form.reset();
			if (onSuccess) onSuccess();
		},
		onError: (error: AxiosError<ApiErrorData>) => {
			if (error.response?.status === 400 && error.response?.data?.errors) {
				setApiErrors(error.response.data.errors, form.setError);
			} else {
				toast.error(
					error.response?.data?.detail || "Si è verificato un errore durante la creazione.",
				);
			}
		},
	});

	const onSubmit = (data: PlayerFormValues) => {
		mutation.mutate(data);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="space-y-4 max-w-md mx-auto p-6 border rounded-lg shadow-sm bg-card text-card-foreground"
			>
				<h2 className="text-2xl font-bold mb-4">Registra Giocatore</h2>

				<FormField
					control={form.control}
					name="nickname"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Nickname</FormLabel>
							<FormControl>
								<Input placeholder="Es. TheBomber" className="bg-background" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<div className="grid grid-cols-2 gap-4">
					<FormField
						control={form.control}
						name="firstName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Nome</FormLabel>
								<FormControl>
									<Input className="bg-background" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="lastName"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Cognome</FormLabel>
								<FormControl>
									<Input className="bg-background" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="mario.rossi@azienda.com"
									className="bg-background"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full" disabled={mutation.isPending}>
					{mutation.isPending ? "Salvataggio..." : "Crea Giocatore"}
				</Button>
			</form>
		</Form>
	);
};
