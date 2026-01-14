import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

export const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await api.post("/api/auth/login", { email, password });
			login(res.data.token, res.data.roles);
			navigate("/"); // Torna alla dashboard
		} catch {
			setError("Credenziali non valide");
		}
	};

	return (
		<div className="flex items-center justify-center h-screen bg-gray-100">
			<div className="p-8 bg-white rounded shadow-md w-96">
				<h1 className="text-2xl font-bold mb-6 text-center">Login Goleador</h1>
				<form onSubmit={handleLogin} className="space-y-4">
					<div>
						<Label>Email</Label>
						<Input
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							type="email"
							placeholder="admin@goleador.com"
						/>
					</div>
					<div>
						<Label>Password</Label>
						<Input
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							type="password"
						/>
					</div>
					{error && <p className="text-red-500 text-sm">{error}</p>}
					<Button type="submit" className="w-full">
						Accedi
					</Button>
				</form>
			</div>
		</div>
	);
};
