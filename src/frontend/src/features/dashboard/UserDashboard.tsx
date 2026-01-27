import { useQueries, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Calendar,
	Flame,
	Gamepad2,
	History,
	Loader2,
	Swords,
	TrendingUp,
	Trophy,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { getRecentMatches } from "@/api/matches";
import { getPlayerProfile } from "@/api/players";
import { getTournamentById, getTournaments } from "@/api/tournaments";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import type { TournamentMatch } from "@/types";

export const UserDashboard = () => {
	const { userId: _userId } = useAuth();

	// 1. Fetch Player Profile (Current User)
	const { data: profile, isLoading: isProfileLoading } = useQuery({
		queryKey: ["player-profile", "me"],
		queryFn: () => getPlayerProfile(),
	});

	// 2. Fetch Global Recent Matches
	const { data: recentMatches, isLoading: isRecentLoading } = useQuery({
		queryKey: ["recent-matches"],
		queryFn: getRecentMatches,
	});

	// 3. Fetch Tournaments to find pending matches
	const { data: tournaments, isLoading: isTournamentsLoading } = useQuery({
		queryKey: ["tournaments"],
		queryFn: getTournaments,
	});

	const activeTournamentIds = useMemo(
		() => tournaments?.filter((t) => t.status === 1).map((t) => t.id) || [],
		[tournaments],
	);

	// Fetch details for each active tournament
	const tournamentDetails = useQueries({
		queries: activeTournamentIds.map((id) => ({
			queryKey: ["tournament", id],
			queryFn: () => getTournamentById(id),
		})),
	});

	const isDetailsLoading = tournamentDetails.some((q) => q.isLoading);

	// Filter pending matches where the user is a participant
	const pendingMatches = useMemo(() => {
		if (!profile) return [];
		const matches: (TournamentMatch & { tournamentName: string; tournamentId: string })[] = [];

		for (const query of tournamentDetails) {
			if (query.data) {
				const tournament = query.data;
				const userMatches = tournament.matches
					.filter((m) => {
						if (m.status !== 0) return false;

						// Find if user is in home or away team
						const isUserInMatch = tournament.teams.some(
							(team) =>
								(team.id === m.homeTeamId || team.id === m.awayTeamId) &&
								team.players.some((p) => p.id === profile.id),
						);

						return isUserInMatch;
					})
					.map((m) => ({ ...m, tournamentName: tournament.name, tournamentId: tournament.id }));

				matches.push(...userMatches);
			}
		}
		return matches.sort(
			(a, b) => (a.round || 0) - (b.round || 0) || a.tournamentName.localeCompare(b.tournamentName),
		);
	}, [tournamentDetails, profile]);

	// Calculate Current Streak from profile.recentMatches
	const currentStreak = useMemo(() => {
		if (!profile?.recentMatches) return 0;
		let streak = 0;
		for (const match of profile.recentMatches) {
			if (match.result === "W") {
				streak++;
			} else if (match.result === "L" || match.result === "D") {
				break;
			}
		}
		return streak;
	}, [profile]);

	if (isProfileLoading || isTournamentsLoading) {
		return (
			<div className="container mx-auto px-4 py-8 space-y-8">
				<Skeleton className="h-48 w-full rounded-3xl" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Skeleton className="h-32 rounded-xl" />
					<Skeleton className="h-32 rounded-xl" />
					<Skeleton className="h-32 rounded-xl" />
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<Skeleton className="h-96 rounded-xl" />
					<Skeleton className="h-96 rounded-xl" />
				</div>
			</div>
		);
	}

	if (!profile) return null;

	const initials = profile.nickname.slice(0, 2).toUpperCase();

	// Recharts data for Win Rate
	const winRateData = [
		{ name: "Vinte", value: profile.wins, color: "hsl(var(--primary))" },
		{ name: "Perse", value: profile.losses, color: "hsl(var(--destructive))" },
		{
			name: "Pareggi",
			value: Math.max(0, profile.totalMatches - profile.wins - profile.losses),
			color: "hsl(var(--muted))",
		},
	].filter((d) => d.value > 0);

	return (
		<div className="container mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
			{/* HERO CARD */}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="relative overflow-hidden rounded-3xl bg-linear-to-br from-blue-600 to-indigo-900 p-8 text-white shadow-xl"
			>
				<div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
				<div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />

				<div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
					<div className="flex flex-col md:flex-row items-center gap-6">
						<Avatar className="h-24 w-24 border-4 border-white/20 shadow-2xl">
							<AvatarFallback className="bg-white/10 text-3xl font-bold text-white backdrop-blur-md">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="text-center md:text-left space-y-2">
							<h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
								Bentornato, {profile.nickname}!
							</h1>
							<div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
								<div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
									<Trophy className="h-5 w-5 text-yellow-400 fill-yellow-400" />
									<span className="text-2xl font-black">{profile.eloRating}</span>
									<span className="text-xs font-bold uppercase tracking-tighter opacity-70">
										ELO
									</span>
								</div>
								<Badge className="bg-green-500/20 text-green-300 border-green-500/30 px-3 py-1">
									<TrendingUp className="h-3 w-3 mr-1" /> +12 questa settimana
								</Badge>
							</div>
						</div>
					</div>

					<Button
						asChild
						size="lg"
						className="bg-white text-indigo-900 hover:bg-white/90 rounded-2xl h-14 px-8 font-bold text-lg shadow-lg transition-transform hover:scale-105 active:scale-95"
					>
						<Link to="/matches">
							<Gamepad2 className="mr-2 h-6 w-6" /> Registra Amichevole
						</Link>
					</Button>
				</div>
			</motion.div>

			{/* STATS GRID */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Win Rate */}
				<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
							<TrendingUp className="h-4 w-4 text-blue-500" /> Win Rate
						</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center justify-between">
						<div className="flex flex-col">
							<span className="text-4xl font-black">{profile.winRate}%</span>
							<span className="text-xs text-muted-foreground font-medium">Precisione di gioco</span>
						</div>
						<div className="h-20 w-20">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={winRateData}
										cx="50%"
										cy="50%"
										innerRadius={25}
										outerRadius={35}
										paddingAngle={5}
										dataKey="value"
										stroke="none"
									>
										{winRateData.map((entry) => (
											<Cell key={entry.name} fill={entry.color} />
										))}
									</Pie>
								</PieChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* Current Streak */}
				<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
							<Flame className="h-4 w-4 text-orange-500" /> Current Streak
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center gap-4">
							<div className="text-4xl font-black flex items-center gap-2">
								{currentStreak}
								{currentStreak >= 3 && (
									<motion.div
										animate={{ scale: [1, 1.2, 1] }}
										transition={{ repeat: Infinity, duration: 2 }}
									>
										<Flame className="h-8 w-8 text-orange-500 fill-orange-500" />
									</motion.div>
								)}
							</div>
							<div className="flex flex-col">
								<span className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
									Vittorie consecutive
								</span>
								<div className="flex gap-1 mt-1">
									{profile.recentMatches.slice(0, 5).map((m) => (
										<div
											key={m.id}
											className={cn(
												"h-1.5 w-6 rounded-full",
												m.result === "W"
													? "bg-green-500"
													: m.result === "L"
														? "bg-red-500"
														: "bg-muted",
											)}
										/>
									))}
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Total Goals */}
				<Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow bg-card">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
							<Swords className="h-4 w-4 text-indigo-500" /> Total Goals
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex justify-between items-end">
							<div className="flex flex-col">
								<span className="text-4xl font-black">
									{profile.goalsFor + profile.goalsAgainst}
								</span>
								<span className="text-xs text-muted-foreground font-medium">Goal totali</span>
							</div>
							<div className="flex flex-col items-end gap-1">
								<div className="flex items-center gap-2 text-xs font-bold">
									<span className="text-green-600">Fatti: {profile.goalsFor}</span>
									<span className="text-muted-foreground">/</span>
									<span className="text-red-600">Subiti: {profile.goalsAgainst}</span>
								</div>
								<div className="w-32 h-2 bg-muted rounded-full overflow-hidden flex">
									<div
										className="bg-green-500 h-full"
										style={{
											width: `${(profile.goalsFor / (profile.goalsFor + profile.goalsAgainst || 1)) * 100}%`,
										}}
									/>
									<div
										className="bg-red-500 h-full flex-1"
										style={{
											width: `${(profile.goalsAgainst / (profile.goalsFor + profile.goalsAgainst || 1)) * 100}%`,
										}}
									/>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* MAIN CONTENT GRID */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* PENDING MATCHES */}
				<Card className="border-none shadow-md flex flex-col min-h-[400px]">
					<CardHeader className="border-b bg-muted/30 py-4">
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg font-bold flex items-center gap-2">
								<Calendar className="h-5 w-5 text-primary" /> Partite da Giocare
							</CardTitle>
							<Badge variant="secondary" className="rounded-full">
								{pendingMatches.length}
							</Badge>
						</div>
					</CardHeader>
					<CardContent className="p-0 flex-1">
						<ScrollArea className="h-[400px]">
							{isDetailsLoading && pendingMatches.length === 0 ? (
								<div className="flex items-center justify-center h-48">
									<Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
								</div>
							) : pendingMatches.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-64 text-center px-8">
									<div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
										<Gamepad2 className="h-8 w-8 text-muted-foreground opacity-30" />
									</div>
									<h3 className="font-bold text-foreground/80">Nessuna partita pendente</h3>
									<p className="text-sm text-muted-foreground mt-1">
										Tutto calmo sul fronte occidentale. Goditi la pausa!
									</p>
								</div>
							) : (
								<div className="divide-y divide-border/50">
									{pendingMatches.map((match) => (
										<Link
											key={match.id}
											to={`/tournaments/${match.tournamentId}`}
											className="block p-5 hover:bg-muted/50 transition-colors group"
										>
											<div className="flex items-center justify-between gap-4">
												<div className="space-y-1">
													<div className="flex items-center gap-2">
														<span className="text-xs font-bold text-primary uppercase tracking-tighter bg-primary/10 px-2 py-0.5 rounded">
															Round {match.round}
														</span>
														<span className="text-xs font-medium text-muted-foreground">
															{match.tournamentName}
														</span>
													</div>
													<div className="text-lg font-bold flex items-center gap-3">
														<span className="text-blue-700 dark:text-blue-400">
															{match.homeTeamName}
														</span>
														<span className="text-muted-foreground text-xs font-normal">vs</span>
														<span className="text-red-700 dark:text-red-400">
															{match.awayTeamName}
														</span>
													</div>
												</div>
												<div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
													<ArrowRight className="h-5 w-5" />
												</div>
											</div>
										</Link>
									))}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>

				{/* ACTIVITY FEED */}
				<Card className="border-none shadow-md flex flex-col min-h-[400px]">
					<CardHeader className="border-b bg-muted/30 py-4">
						<CardTitle className="text-lg font-bold flex items-center gap-2">
							<History className="h-5 w-5 text-indigo-500" /> Attività Recente
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0 flex-1">
						<ScrollArea className="h-[400px]">
							{isRecentLoading ? (
								<div className="flex items-center justify-center h-48">
									<Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
								</div>
							) : !recentMatches || recentMatches.length === 0 ? (
								<div className="flex flex-col items-center justify-center h-64 text-center px-8">
									<History className="h-12 w-12 text-muted-foreground opacity-10 mb-4" />
									<p className="text-muted-foreground italic">Nessuna partita recente globale.</p>
								</div>
							) : (
								<div className="divide-y divide-border/50">
									{recentMatches.slice(0, 10).map((match) => {
										const isHomeWinner = match.scoreHome > match.scoreAway;
										const winner = isHomeWinner ? match.homeTeamName : match.awayTeamName;
										const loser = isHomeWinner ? match.awayTeamName : match.homeTeamName;
										const score = isHomeWinner
											? `${match.scoreHome}-${match.scoreAway}`
											: `${match.scoreAway}-${match.scoreHome}`;

										return (
											<div key={match.id} className="p-5 flex items-start gap-4">
												<div
													className={cn(
														"h-10 w-10 rounded-full flex items-center justify-center shrink-0",
														isHomeWinner
															? "bg-blue-500/10 text-blue-600"
															: "bg-red-500/10 text-red-600",
													)}
												>
													<Trophy className="h-5 w-5" />
												</div>
												<div className="flex-1 space-y-1">
													<p className="text-sm font-medium leading-relaxed">
														<span className="font-bold">{winner}</span>
														<span className="text-muted-foreground mx-1">ha sconfitto</span>
														<span className="font-bold">{loser}</span>
														<span className="ml-2 font-mono font-black text-primary bg-primary/5 px-2 py-0.5 rounded">
															({score})
														</span>
													</p>
													<div className="flex items-center gap-2 text-xs text-muted-foreground">
														<Calendar className="h-3 w-3" />
														{formatDistanceToNow(new Date(match.datePlayed), {
															addSuffix: true,
															locale: it,
														})}
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</ScrollArea>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};
