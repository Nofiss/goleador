import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
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
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");

	const mutation = useMutation({
		mutationFn: resetPassword,
		onSuccess: () => {
			toast.success("Password aggiornata! Ora puoi accedere.");
			navigate("/login");
		},
		onError: (err: unknown) => {
			const error = err as { response?: { data?: { message?: string } } };
			setError(error.response?.data?.message || "Errore nel reset della password.");
		},
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
							<Label htmlFor="password">Nuova Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="pl-9 pr-10"
								/>
								<Lock
									className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50"
									aria-hidden="true"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-2.5 text-muted-foreground/50 hover:text-foreground transition-colors"
									aria-label={showPassword ? "Nascondi password" : "Mostra password"}
								>
									{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
								</button>
							</div>
						</div>
						<div className="space-y-2">
							<Label htmlFor="confirmPassword">Conferma Password</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									required
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className="pl-9 pr-10"
								/>
								<Lock
									className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50"
									aria-hidden="true"
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-3 top-2.5 text-muted-foreground/50 hover:text-foreground transition-colors"
									aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
								>
									{showConfirmPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</button>
							</div>
						</div>

						{error && <p className="text-red-500 text-sm">{error}</p>}

						<Button type="submit" className="w-full" disabled={mutation.isPending}>
							{mutation.isPending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Aggiornamento in corso...
								</>
							) : (
								"Aggiorna Password"
							)}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};
