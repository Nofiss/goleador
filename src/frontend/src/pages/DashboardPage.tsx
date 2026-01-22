import { useQuery } from "@tanstack/react-query";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CalendarDays, Flame, Gamepad2, Sparkles, Trophy } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { getTournaments } from "@/api/tournaments";
import { useTheme } from "@/components/ThemeProvider"; // Importa useTheme
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { TournamentStatus } from "@/types";

// --- ANIMATION VARIANTS (rimangono invariati, Framer Motion gestisce colori dinamicamente) ---
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: { staggerChildren: 0.1 },
	},
};

const itemVariants = {
	hidden: { y: 20, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 100 },
	},
} as Variants;

export const DashboardPage = () => {
	const { isAuthenticated } = useAuth();

	const { data: tournaments, isLoading } = useQuery({
		queryKey: ["tournaments"],
		queryFn: getTournaments,
	});
	const { theme } = useTheme(); // Ottieni il tema corrente

	const activeTournaments = useMemo(
		() => tournaments?.filter((t) => t.status === TournamentStatus.active) || [],
		[tournaments],
	);
	const setupTournaments = useMemo(
		() => tournaments?.filter((t) => t.status === TournamentStatus.setup) || [],
		[tournaments],
	);

	return (
		<div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
			{/* 1. BACKGROUND DINAMICO (Aurora Effect - ora con colori adattivi) */}
			<div
				className={cn(
					"absolute inset-0 -z-10",
					theme === "dark" ? "bg-slate-950" : "bg-white", // Sfondo dinamico
				)}
			>
				{/* Effetti aurora (colori adattivi o sempre scuri per un contrasto wow) */}
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 dark:bg-blue-600/20 blur-[120px] animate-pulse" />
				<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 dark:bg-purple-600/20 blur-[120px] animate-pulse delay-1000" />
				{/* Grid Pattern Overlay (solo su tema scuro per ora, o con un pattern più sottile per light) */}
				{theme === "dark" && (
					<div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
				)}
			</div>

			<div className="container mx-auto px-4 py-12 relative z-10">
				{/* 2. HERO SECTION */}
				<motion.div
					className="text-center mb-16 space-y-6"
					initial="hidden"
					animate="visible"
					variants={containerVariants}
				>
					{/* Badge */}
					<motion.div
						variants={itemVariants}
						className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-sm font-medium mb-4"
					>
						<Sparkles className="w-4 h-4" />
						<span>La nuova era del biliardino aziendale</span>
					</motion.div>

					{/* Titolo */}
					<motion.h1
						variants={itemVariants}
						className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-800 dark:text-white drop-shadow-lg"
					>
						Diventa una <br />
						<span className="bg-clip-text text-transparent bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x">
							Leggenda di Goleador
						</span>
					</motion.h1>

					{/* Descrizione */}
					<motion.p
						variants={itemVariants}
						className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
					>
						Gestisci tornei, sfida i colleghi e scala la classifica. Non è solo un gioco, è gloria
						eterna (fino alla pausa caffè).
					</motion.p>

					{/* Bottoni */}
					<motion.div
						variants={itemVariants}
						className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
					>
						<Button
							asChild
							size="lg"
							className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg h-14 px-8 rounded-full shadow-lg transition-transform hover:scale-105"
						>
							<Link to="/matches">
								<Gamepad2 className="mr-2 h-5 w-5" /> Gioca Subito
							</Link>
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="border-secondary-foreground/20 text-secondary-foreground hover:bg-accent hover:text-accent-foreground text-lg h-14 px-8 rounded-full backdrop-blur-sm"
						>
							<Link to="/tournaments">Vedi Classifiche</Link>
						</Button>
					</motion.div>
				</motion.div>

				{/* 3. CARDS SECTION */}
				<div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
					{/* CARD: TORNEI ATTIVI */}
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.4, duration: 0.5 }}
						className="group relative"
					>
						{/* Glow Effect */}
						<div className="absolute -inset-0.5 bg-linear-to-r from-orange-600 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

						<div className="relative h-full bg-card text-card-foreground border border-border rounded-xl p-6 sm:p-8 flex flex-col shadow-lg">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-3 bg-orange-500/10 rounded-lg">
									<Flame className="w-8 h-8 text-orange-500" />
								</div>
								<div>
									<h2 className="text-2xl font-bold">Lotta per il Titolo</h2>
									<p className="text-muted-foreground">Tornei in corso adesso</p>
								</div>
							</div>

							<div className="space-y-3 flex-1">
								{isLoading ? (
									Array.from({ length: 3 }).map((_, i) => (
										<div
											key={i}
											className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
										>
											<div className="space-y-2">
												<Skeleton className="h-5 w-40" />
												<Skeleton className="h-3 w-20" />
											</div>
											<Skeleton className="h-5 w-5" />
										</div>
									))
								) : activeTournaments.length === 0 ? (
									<div className="h-full flex items-center justify-center text-muted-foreground italic border border-dashed border-border rounded-lg min-h-30">
										Nessun torneo attivo. Accendi la miccia!
									</div>
								) : (
									activeTournaments.map((t) => (
										<Link key={t.id} to={`/tournaments/${t.id}`}>
											<div className="group/item flex items-center justify-between p-4 rounded-lg bg-secondary/30 dark:bg-secondary/20 hover:bg-secondary border border-border/50 transition-all hover:translate-x-1">
												<div>
													<h4 className="font-bold text-foreground">{t.name}</h4>
													<span className="text-xs text-muted-foreground">
														{t.teamSize} vs {t.teamSize}
													</span>
												</div>
												<ArrowRight className="w-5 h-5 text-muted-foreground group-hover/item:text-orange-400 transition-colors" />
											</div>
										</Link>
									))
								)}
							</div>
						</div>
					</motion.div>

					{/* CARD: ISCRIZIONI */}
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.5, duration: 0.5 }}
						className="group relative"
					>
						{/* Glow Effect */}
						<div className="absolute -inset-0.5 bg-linear-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />

						<div className="relative h-full bg-card text-card-foreground border border-border rounded-xl p-6 sm:p-8 flex flex-col shadow-lg">
							<div className="flex items-center gap-3 mb-6">
								<div className="p-3 bg-blue-500/10 rounded-lg">
									<CalendarDays className="w-8 h-8 text-blue-500" />
								</div>
								<div>
									<h2 className="text-2xl font-bold text-foreground">Prossime Sfide</h2>
									<p className="text-muted-foreground">Iscrizioni aperte</p>
								</div>
							</div>

							<div className="space-y-3 flex-1">
								{isLoading ? (
									Array.from({ length: 3 }).map((_, i) => (
										<div
											key={i}
											className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
										>
											<div className="space-y-2">
												<Skeleton className="h-5 w-40" />
												<Skeleton className="h-4 w-24 rounded-full" />
											</div>
											{isAuthenticated && <Skeleton className="h-9 w-24 rounded-md" />}
										</div>
									))
								) : setupTournaments.length === 0 ? (
									<div className="h-full flex items-center justify-center text-muted-foreground italic border border-dashed border-border rounded-lg min-h-30">
										Tutto tranquillo... Troppo tranquillo.
									</div>
								) : (
									setupTournaments.map((t) => (
										<div
											key={t.id}
											className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 dark:bg-secondary/20 border border-border/50"
										>
											<div>
												<h4 className="font-bold text-foreground">{t.name}</h4>
												<Badge
													variant="secondary"
													className="mt-1 bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-500/20 border-blue-500/20"
												>
													Posti aperti
												</Badge>
											</div>
											{isAuthenticated && (
												<Button asChild className="bg-primary hover:bg-primary/90">
													<Link to={`/tournaments/${t.id}`}>Iscriviti</Link>
												</Button>
											)}
										</div>
									))
								)}
							</div>
						</div>
					</motion.div>
				</div>

				{/* 4. STATS BANNER */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.8 }}
					className="mt-20 border-t border-border pt-10 text-center"
				>
					<p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">Powered by</p>
					<div className="flex justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
						<Trophy className="w-8 h-8 text-yellow-500" />
						<Gamepad2 className="w-8 h-8 text-purple-500" />
						<Flame className="w-8 h-8 text-orange-500" />
					</div>
				</motion.div>
			</div>
		</div>
	);
};
