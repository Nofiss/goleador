import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePlayerFormProps {
	onSuccess?: () => void;
}

// Definiamo il tipo dei dati che mandiamo al server
interface CreatePlayerRequest {
	nickname: string;
	firstName: string;
	lastName: string;
	email: string;
}

export const CreatePlayerForm = ({ onSuccess }: CreatePlayerFormProps) => {
	// Stato locale per i campi del form
	const [formData, setFormData] = useState<CreatePlayerRequest>({
		nickname: "",
		firstName: "",
		lastName: "",
		email: "",
	});

	const [message, setMessage] = useState<string>("");

	// TanStack Query Mutation: gestisce lo stato della chiamata (loading, error, success)
	const mutation = useMutation({
		mutationFn: (newPlayer: CreatePlayerRequest) => {
			return api.post("/players", newPlayer);
		},
		onSuccess: () => {
			setMessage("✅ Giocatore creato con successo!");
			setFormData({ nickname: "", firstName: "", lastName: "", email: "" }); // Reset form
			if (onSuccess) onSuccess();
		},
		onError: (error: any) => {
			// Qui intercettiamo l'errore 400 che abbiamo configurato nel backend
			const errorData = error.response?.data;
			if (errorData?.errors) {
				setMessage(`❌ Errore: ${JSON.stringify(errorData.errors)}`);
			} else {
				setMessage("❌ Si è verificato un errore.");
			}
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setMessage("");
		mutation.mutate(formData);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 max-w-md mx-auto p-6 border rounded-lg shadow-sm bg-white"
		>
			<h2 className="text-2xl font-bold mb-4">Registra Giocatore</h2>

			<div className="space-y-2">
				<Label htmlFor="nickname">Nickname</Label>
				<Input
					id="nickname"
					name="nickname"
					placeholder="Es. TheBomber"
					value={formData.nickname}
					onChange={handleChange}
				/>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="firstName">Nome</Label>
					<Input
						id="firstName"
						name="firstName"
						value={formData.firstName}
						onChange={handleChange}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="lastName">Cognome</Label>
					<Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
				</div>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					placeholder="mario.rossi@azienda.com"
					value={formData.email}
					onChange={handleChange}
				/>
			</div>

			<Button type="submit" className="w-full" disabled={mutation.isPending}>
				{mutation.isPending ? "Salvataggio..." : "Crea Giocatore"}
			</Button>

			{message && (
				<div
					className={`p-3 rounded text-sm ${message.startsWith("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
				>
					{message}
				</div>
			)}
		</form>
	);
};
