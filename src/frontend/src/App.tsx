import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layouts/AppLayout";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { MatchCreatePage } from "@/pages/matches/MatchCreatePage";
import { MatchesListPage } from "@/pages/matches/MatchesListPage";
import { GlobalRankingPage } from "@/pages/players/GlobalRankingPage";
import { PlayerCreatePage } from "@/pages/players/PlayerCreatePage";
import { PlayersListPage } from "@/pages/players/PlayersListPage";
import { TournamentCreatePage } from "@/pages/tournaments/TournamentCreatePage";
import { TournamentDetailPage } from "@/pages/tournaments/TournamentDetailPage";
import { TournamentsListPage } from "@/pages/tournaments/TournamentsListPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { TablesPage } from "./pages/tables/TablesPage";
import { UsersPage } from "./pages/users/UsersPage";

function App() {
	return (
		<BrowserRouter>
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
		</BrowserRouter>
	);
}

export default App;
