import { ChevronLeft, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import { AppLogo } from "@/components/AppLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const RegisterPage = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			return setError("Le password non coincidono");
		}

		setIsLoading(true);
		setError("");

		try {
			await api.post("/auth/register", formData);
			navigate("/login"); // Reindirizza al login dopo il successo
		} catch (err: unknown) {
			const error = err as { response?: { data?: { message?: string } } };
			setError(error.response?.data?.message || "Errore durante la registrazione");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-background relative px-4 py-12 overflow-hidden">
			{/* Decorazione Sfondo */}
			<div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
				<div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
			</div>

			<div className="absolute top-4 left-4 sm:top-8 sm:left-8">
				<Button
					variant="ghost"
					asChild
					className="gap-2 text-muted-foreground hover:text-foreground"
				>
					<Link to="/">
						<ChevronLeft className="h-4 w-4" /> Home
					</Link>
				</Button>
			</div>

			<div className="w-full max-w-md">
				<div className="flex flex-col items-center mb-8">
					<AppLogo variant="vertical" size="lg" className="mb-2" />
					<p className="text-muted-foreground mt-2 text-center">
						Crea il tuo profilo atleta e inizia a competere
					</p>
				</div>

				<div className="p-8 bg-card rounded-2xl border border-border shadow-xl backdrop-blur-sm">
					<form onSubmit={handleRegister} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2 col-span-2 sm:col-span-1">
								<Label htmlFor="firstName">Nome</Label>
								<div className="relative">
									<Input
										id="firstName"
										placeholder="Mario"
										className="bg-background pl-9"
										onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
										required
									/>
									<User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
								</div>
							</div>
							<div className="space-y-2 col-span-2 sm:col-span-1">
								<Label htmlFor="lastName">Cognome</Label>
								<div className="relative">
									<Input
										id="lastName"
										placeholder="Rossi"
										className="bg-background pl-9"
										onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
										required
									/>
									<User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<div className="relative">
								<Input
									id="email"
									type="email"
									placeholder="mario@esempio.com"
									className="bg-background pl-9"
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									required
								/>
								<Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									className="bg-background pl-9 pr-10"
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									required
								/>
								<Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
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
									className="bg-background pr-10"
									onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
									required
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

						{error && (
							<div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
								{error}
							</div>
						)}

						<Button
							type="submit"
							className="w-full h-11 text-base font-semibold"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creazione account...
								</>
							) : (
								"Registrati"
							)}
						</Button>
					</form>
				</div>

				<p className="text-center text-sm text-muted-foreground mt-8">
					Hai già un account?{" "}
					<Link to="/login" className="font-semibold text-primary hover:underline">
						Accedi
					</Link>
				</p>
			</div>
		</div>
	);
};
