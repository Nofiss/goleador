import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	Activity,
	ArrowDownCircle,
	ArrowUpCircle,
	Flame,
	Percent,
	Trophy,
	Users,
} from "lucide-react";
import { memo, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getPlayerProfile } from "@/api/players";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { MatchBriefDto } from "@/types";

const RecentMatchRow = memo(({ match }: { match: MatchBriefDto }) => {
	const label = match.result === "W" ? "Vittoria" : match.result === "L" ? "Sconfitta" : "Pareggio";

	return (
		<TableRow>
			<TableCell className="pl-6 text-xs text-muted-foreground">
				{new Date(match.datePlayed).toLocaleDateString()}
			</TableCell>
			<TableCell className="text-sm font-medium">
				<div className="flex flex-col gap-0.5">
					<span className="text-blue-600 dark:text-blue-400">{match.homeTeamName}</span>
					<span className="text-red-600 dark:text-red-400">{match.awayTeamName}</span>
				</div>
			</TableCell>
			<TableCell className="text-center font-mono font-bold">
				{match.scoreHome} - {match.scoreAway}
			</TableCell>
			<TableCell className="text-center pr-6">
				<motion.div whileHover={{ scale: 1.15 }} transition={{ type: "spring", stiffness: 400 }}>
					<Badge
						variant={
							match.result === "W" ? "default" : match.result === "L" ? "destructive" : "secondary"
						}
						className="w-8 justify-center cursor-default"
						title={label}
						aria-label={label}
					>
						{match.result}
					</Badge>
				</motion.div>
			</TableCell>
		</TableRow>
	);
});

RecentMatchRow.displayName = "RecentMatchRow";

export const ProfilePage = () => {
	const { id } = useParams<{ id: string }>();

	const {
		data: profile,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["player-profile", id || "me"],
		queryFn: () => getPlayerProfile(id),
	});

	const initials = useMemo(
		() => profile?.nickname.substring(0, 2).toUpperCase() || "",
		[profile?.nickname],
	);

	const winLossData = useMemo(() => {
		if (!profile) return [];
		return [
			{
				name: "Vittorie",
				value: profile.wins,
				color: "hsl(var(--primary))",
			},
			{
				name: "Sconfitte",
				value: profile.losses,
				color: "hsl(var(--destructive))",
			},
			{
				name: "Pareggi",
				value: Math.max(0, profile.totalMatches - profile.wins - profile.losses),
				color: "hsl(var(--muted))",
			},
		].filter((d) => d.value > 0);
	}, [profile]);

	if (isLoading) {
		return (
			<div className="container mx-auto p-4 md:p-8 space-y-8">
				<div className="flex flex-col md:flex-row items-center gap-6">
					<Skeleton className="h-24 w-24 rounded-full" />
					<div className="space-y-2 text-center md:text-left">
						<Skeleton className="h-10 w-48" />
						<Skeleton className="h-6 w-32" />
					</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-32 rounded-xl" />
					))}
				</div>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className="container mx-auto p-8 text-center">
				<h2 className="text-2xl font-bold text-red-600">Errore nel caricamento del profilo</h2>
				<p className="text-muted-foreground mt-2">
					Assicurati che il giocatore esista o riprova più tardi.
				</p>
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-7xl p-4 md:p-8 space-y-8">
			{/* Header */}
			<div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-card p-6 rounded-2xl shadow-sm border">
				<Avatar className="h-24 w-24 border-4 border-primary/10">
					<AvatarFallback className="text-2xl font-bold bg-primary/5 text-primary">
						{initials}
					</AvatarFallback>
				</Avatar>

				<div className="flex-1 text-center md:text-left space-y-2">
					<div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
						<h1 className="text-3xl font-bold tracking-tight">{profile.nickname}</h1>
						<Badge variant="secondary" className="w-fit mx-auto md:mx-0 text-sm py-1 px-3">
							<Trophy className="w-3.5 h-3.5 mr-1.5 text-yellow-500 fill-yellow-500" />
							{profile.eloRating} ELO
						</Badge>
					</div>
					<p className="text-muted-foreground font-medium">{profile.fullName}</p>
				</div>
			</div>

			{/* KPI Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Partite Totali</CardTitle>
						<Activity className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{profile.totalMatches}</div>
						<p className="text-xs text-muted-foreground">Disputate finora</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Win Rate</CardTitle>
						<Percent className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{profile.winRate}%</div>
						<div className="w-full bg-secondary h-2 mt-2 rounded-full overflow-hidden">
							<div
								className="bg-primary h-full transition-all"
								style={{ width: `${profile.winRate}%` }}
							/>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Vittorie</CardTitle>
						<ArrowUpCircle className="h-4 w-4 text-green-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{profile.wins}</div>
						<p className="text-xs text-muted-foreground">Partite vinte</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Sconfitte</CardTitle>
						<ArrowDownCircle className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{profile.losses}</div>
						<p className="text-xs text-muted-foreground">Partite perse</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Win/Loss Chart */}
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle className="text-lg">Rendimento</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="h-[250px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={winLossData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={80}
										paddingAngle={5}
										dataKey="value"
									>
										{winLossData.map((entry) => (
											<Cell key={entry.name} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											backgroundColor: "hsl(var(--card))",
											borderColor: "hsl(var(--border))",
											borderRadius: "8px",
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						</div>
						<div className="flex justify-center gap-4 mt-4">
							<div className="flex items-center gap-1.5">
								<div className="w-3 h-3 rounded-full bg-primary" />
								<span className="text-xs font-medium">Wins</span>
							</div>
							<div className="flex items-center gap-1.5">
								<div className="w-3 h-3 rounded-full bg-destructive" />
								<span className="text-xs font-medium">Losses</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Social Section and History */}
				<div className="lg:col-span-2 space-y-8">
					{/* Social Section */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{profile.bestPartner ? (
							<Card className="border-green-100 bg-green-50/30">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium flex items-center gap-2 text-green-700">
										<Users className="h-4 w-4" /> Miglior Alleato
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Link
										to={`/players/${profile.bestPartner.playerId}`}
										className="text-xl font-bold hover:underline"
									>
										{profile.bestPartner.nickname}
									</Link>
									<p className="text-sm text-muted-foreground mt-1">
										{profile.bestPartner.count} vittorie insieme
									</p>
								</CardContent>
							</Card>
						) : (
							<Card className="bg-muted/30 border-dashed">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										Miglior Alleato
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground italic">Dati non sufficienti</p>
								</CardContent>
							</Card>
						)}

						{profile.nemesis ? (
							<Card className="border-red-100 bg-red-50/30">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700">
										<Flame className="h-4 w-4" /> Peggior Incubo
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Link
										to={`/players/${profile.nemesis.playerId}`}
										className="text-xl font-bold hover:underline"
									>
										{profile.nemesis.nickname}
									</Link>
									<p className="text-sm text-muted-foreground mt-1">
										{profile.nemesis.count} sconfitte subite
									</p>
								</CardContent>
							</Card>
						) : (
							<Card className="bg-muted/30 border-dashed">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-medium text-muted-foreground">
										Peggior Incubo
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground italic">Dati non sufficienti</p>
								</CardContent>
							</Card>
						)}
					</div>

					{/* Recent Matches */}
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Ultime Partite</CardTitle>
						</CardHeader>
						<CardContent className="p-0">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="pl-6">Data</TableHead>
										<TableHead>Squadre</TableHead>
										<TableHead className="text-center">Risultato</TableHead>
										<TableHead className="text-center pr-6">Esito</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{profile.recentMatches.length === 0 ? (
										<TableRow>
											<TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
												Nessuna partita recente.
											</TableCell>
										</TableRow>
									) : (
										profile.recentMatches.map((match) => (
											<RecentMatchRow key={match.id} match={match} />
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};
