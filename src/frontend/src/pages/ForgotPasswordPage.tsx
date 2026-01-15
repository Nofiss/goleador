import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Mail, CheckCircle2 } from "lucide-react";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppLogo } from "@/components/AppLogo";

export const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			await api.post("/api/auth/forgot-password", { email });
			setIsSubmitted(true);
		} catch (err) {
			setError("Impossibile trovare un account con questa email.");
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

			<div className="w-full max-w-md">
				<div className="flex flex-col items-center mb-8">
					<AppLogo variant="vertical" size="lg" className="mb-2" />
				</div>

				<div className="p-8 bg-card rounded-2xl border border-border shadow-xl backdrop-blur-sm">
					{!isSubmitted ? (
						<>
							<div className="mb-6">
								<h1 className="text-2xl font-bold text-foreground">Recupera Password</h1>
								<p className="text-sm text-muted-foreground mt-2">
									Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.
								</p>
							</div>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div className="space-y-2">
									<Label htmlFor="email">Email</Label>
									<div className="relative">
										<Input
											id="email"
											type="email"
											placeholder="nome@esempio.com"
											className="bg-background pl-9"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
										/>
										<Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/50" />
									</div>
								</div>

								{error && (
									<div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
										{error}
									</div>
								)}

								<Button type="submit" className="w-full h-11" disabled={isLoading}>
									{isLoading ? "Invio in corso..." : "Invia Link di Reset"}
								</Button>
							</form>
						</>
					) : (
						<div className="text-center py-4">
							<div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-500/10 text-green-500 mb-4">
								<CheckCircle2 className="h-10 w-10" />
							</div>
							<h2 className="text-2xl font-bold text-foreground">Controlla la tua email</h2>
							<p className="text-muted-foreground mt-2">
								Abbiamo inviato un link di recupero a <strong>{email}</strong>.
							</p>
							<Button variant="outline" className="mt-8 w-full" onClick={() => setIsSubmitted(false)}>
								Prova con un'altra email
							</Button>
						</div>
					)}
				</div>

				<div className="text-center mt-8">
					<Button variant="link" asChild className="text-muted-foreground hover:text-primary">
						<Link to="/login" className="flex items-center gap-2">
							<ChevronLeft className="h-4 w-4" /> Torna al Login
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
};
