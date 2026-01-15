import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, Lock } from "lucide-react";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { AppLogo } from "@/components/AppLogo"; // Assicurati che il path sia corretto

export const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const res = await api.post("/api/auth/login", { email, password });
			login(res.data.token, res.data.roles);
			navigate("/");
		} catch {
			setError("Credenziali non valide. Riprova.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative px-4 overflow-hidden">
			{/* Decorazione Sfondo */}
			<div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
				<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
			</div>

			{/* Pulsante Home */}
			<div className="absolute top-4 left-4 sm:top-8 sm:left-8">
				<Button variant="ghost" asChild className="gap-2 text-muted-foreground hover:text-foreground">
					<Link to="/">
						<ChevronLeft className="h-4 w-4" />
						Home
					</Link>
				</Button>
			</div>

			<div className="w-full max-w-md">
				{/* LOGO SOSTITUITO QUI */}
				<div className="flex flex-col items-center mb-8">
					<AppLogo variant="vertical" size="lg" className="mb-2" />
					<p className="text-muted-foreground mt-2">
						Accedi per gestire i tuoi tornei
					</p>
				</div>

				<div className="p-8 bg-card rounded-2xl border border-border shadow-xl backdrop-blur-sm">
					<form onSubmit={handleLogin} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								type="email"
								placeholder="nome@esempio.com"
								className="bg-background"
								required
							/>
						</div>

						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<Label htmlFor="password">Password</Label>
								<Link to="/forgot-password" className="text-xs text-primary hover:underline">
									Password dimenticata?
								</Link>
							</div>
							<div className="relative">
								<Input
									id="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									type="password"
									className="bg-background pr-10"
									required
								/>
								<Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
							</div>
						</div>

						{error && (
							<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-2">
								<div className="h-1.5 w-1.5 rounded-full bg-destructive" />
								{error}
							</div>
						)}

						<Button
							type="submit"
							className="w-full h-11 text-base font-semibold"
							disabled={isLoading}
						>
							{isLoading ? "Accesso in corso..." : "Accedi"}
						</Button>
					</form>
				</div>

				<p className="text-center text-sm text-muted-foreground mt-8">
					Non hai un account?{" "}
					<Link to="/register" className="font-semibold text-primary hover:underline">
						Registrati ora
					</Link>
				</p>
			</div>
		</div>
	);
};
