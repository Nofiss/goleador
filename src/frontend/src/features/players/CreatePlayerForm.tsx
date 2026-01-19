import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePlayerFormProps {
	onSuccess?: () => void;
}

interface CreatePlayerRequest {
	nickname: string;
	firstName: string;
	lastName: string;
	email: string;
}

export const CreatePlayerForm = ({ onSuccess }: CreatePlayerFormProps) => {
	const [formData, setFormData] = useState<CreatePlayerRequest>({
		nickname: "",
		firstName: "",
		lastName: "",
		email: "",
	});

	const [message, setMessage] = useState<{ text: string; type: "success" | "error" | null }>({
		text: "",
		type: null,
	});

	const mutation = useMutation({
		mutationFn: (newPlayer: CreatePlayerRequest) => {
			return api.post("/players", newPlayer);
		},
		onSuccess: () => {
			setMessage({ text: "✅ Giocatore creato con successo!", type: "success" });
			setFormData({ nickname: "", firstName: "", lastName: "", email: "" });
			if (onSuccess) onSuccess();
		},
		onError: (error: any) => {
			const errorData = error.response?.data;
			const errorText = errorData?.errors
				? `❌ Errore: ${JSON.stringify(errorData.errors)}`
				: "❌ Si è verificato un errore.";
			setMessage({ text: errorText, type: "error" });
		},
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setMessage({ text: "", type: null });
		mutation.mutate(formData);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-4 max-w-md mx-auto p-6 border rounded-lg shadow-sm bg-card text-card-foreground"
		>
			<h2 className="text-2xl font-bold mb-4">Registra Giocatore</h2>

			<div className="space-y-2">
				<Label htmlFor="nickname" className="text-sm font-medium">
					Nickname
				</Label>
				<Input
					id="nickname"
					name="nickname"
					placeholder="Es. TheBomber"
					value={formData.nickname}
					onChange={handleChange}
					className="bg-background" // Input leggermente diverso dal fondo card
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
						className="bg-background"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="lastName">Cognome</Label>
					<Input
						id="lastName"
						name="lastName"
						value={formData.lastName}
						onChange={handleChange}
						className="bg-background"
					/>
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
					className="bg-background"
				/>
			</div>

			<Button type="submit" className="w-full" disabled={mutation.isPending}>
				{mutation.isPending ? "Salvataggio..." : "Crea Giocatore"}
			</Button>

			{message.type && (
				<div
					className={`p-3 rounded-md text-sm font-medium border ${
						message.type === "success"
							? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
							: "bg-destructive/15 text-destructive border-destructive/20"
					}`}
				>
					{message.text}
				</div>
			)}
		</form>
	);
};
