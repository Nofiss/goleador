import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layouts/AppLayout";
import { PageLoader } from "@/components/ui/PageLoader";
import { LoginPage } from "@/pages/auth/LoginPage";

const DashboardPage = lazy(() =>
	import("@/pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const TournamentsListPage = lazy(() =>
	import("@/pages/tournaments/TournamentsListPage").then((m) => ({
		default: m.TournamentsListPage,
	})),
);
const TournamentCreatePage = lazy(() =>
	import("@/pages/tournaments/TournamentCreatePage").then((m) => ({
		default: m.TournamentCreatePage,
	})),
);
const TournamentDetailPage = lazy(() =>
	import("@/pages/tournaments/TournamentDetailPage").then((m) => ({
		default: m.TournamentDetailPage,
	})),
);
const MatchesListPage = lazy(() =>
	import("@/pages/matches/MatchesListPage").then((m) => ({
		default: m.MatchesListPage,
	})),
);
const MatchCreatePage = lazy(() =>
	import("@/pages/matches/MatchCreatePage").then((m) => ({
		default: m.MatchCreatePage,
	})),
);
const PlayersListPage = lazy(() =>
	import("@/pages/players/PlayersListPage").then((m) => ({
		default: m.PlayersListPage,
	})),
);
const PlayerCreatePage = lazy(() =>
	import("@/pages/players/PlayerCreatePage").then((m) => ({
		default: m.PlayerCreatePage,
	})),
);
const ProfilePage = lazy(() =>
	import("@/pages/players/ProfilePage").then((m) => ({
		default: m.ProfilePage,
	})),
);
const GlobalRankingPage = lazy(() =>
	import("@/pages/players/GlobalRankingPage").then((m) => ({
		default: m.GlobalRankingPage,
	})),
);
const UsersPage = lazy(() =>
	import("@/pages/users/UsersPage").then((m) => ({ default: m.UsersPage })),
);
const TablesPage = lazy(() =>
	import("@/pages/tables/TablesPage").then((m) => ({ default: m.TablesPage })),
);
const RegisterPage = lazy(() =>
	import("@/pages/auth/RegisterPage").then((m) => ({
		default: m.RegisterPage,
	})),
);
const ForgotPasswordPage = lazy(() =>
	import("@/pages/auth/ForgotPasswordPage").then((m) => ({
		default: m.ForgotPasswordPage,
	})),
);
const ResetPasswordPage = lazy(() =>
	import("@/pages/auth/ResetPasswordPage").then((m) => ({
		default: m.ResetPasswordPage,
	})),
);

function App() {
	return (
		<BrowserRouter>
			<Suspense fallback={<PageLoader />}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/forgot-password" element={<ForgotPasswordPage />} />
					<Route path="/reset-password" element={<ResetPasswordPage />} />

					{/* Rotte Protette dal Layout */}
					<Route element={<AppLayout />}>
						<Route path="/" element={<DashboardPage />} />

						{/* Players Routes */}
						<Route path="/players" element={<PlayersListPage />} />
						<Route path="/players/new" element={<PlayerCreatePage />} />
						<Route path="/players/:id" element={<ProfilePage />} />
						<Route path="/profile" element={<ProfilePage />} />
						<Route path="/ranking" element={<GlobalRankingPage />} />

						{/* Tournaments Routes */}
						<Route path="/tournaments" element={<TournamentsListPage />} />
						<Route path="/tournaments/new" element={<TournamentCreatePage />} />
						<Route path="/tournaments/:id" element={<TournamentDetailPage />} />

						{/* Matches Routes */}
						<Route path="/matches" element={<MatchesListPage />} />
						<Route path="/matches/new" element={<MatchCreatePage />} />

						{/* Tables Routes */}
						<Route path="/tables" element={<TablesPage />} />

						{/* Users Routes */}
						<Route path="/users" element={<UsersPage />} />
					</Route>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
