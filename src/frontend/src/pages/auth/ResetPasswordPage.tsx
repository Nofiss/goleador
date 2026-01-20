import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ResetPasswordPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const email = searchParams.get("email");
	const token = searchParams.get("token");

	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");

	const mutation = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			alert("Password aggiornata! Ora puoi accedere.");
			navigate("/login");
		},
		onError: (err: any) =>
			setError(err.response?.data?.message || "Errore nel reset della password."),
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Le password non coincidono.");
			return;
		}
		if (!email || !token) {
			setError("Link non valido.");
			return;
		}

		mutation.mutate({ email, token, newPassword: password });
	};

	if (!email || !token) return <div className="text-center p-10">Link non valido o scaduto.</div>;

	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<CardTitle>Nuova Password</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<Label>Nuova Password</Label>
							<Input
								type="password"
								required
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div className="space-y-2">
							<Label>Conferma Password</Label>
							<Input
								type="password"
								required
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
						</div>

						{error && <p className="text-red-500 text-sm">{error}</p>}

						<Button type="submit" className="w-full" disabled={mutation.isPending}>
							Aggiorna Password
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
