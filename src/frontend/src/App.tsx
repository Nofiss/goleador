import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LoginPage } from "@/pages/LoginPage";
import { MatchCreatePage } from "@/pages/matches/MatchCreatePage";
import { MatchesListPage } from "@/pages/matches/MatchesListPage";
import { PlayerCreatePage } from "@/pages/players/PlayerCreatePage";
import { PlayersListPage } from "@/pages/players/PlayersListPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TournamentCreatePage } from "@/pages/tournaments/TournamentCreatePage";
import { TournamentDetailPage } from "@/pages/tournaments/TournamentDetailPage";
import { TournamentsListPage } from "@/pages/tournaments/TournamentsListPage";
import { TablesPage } from "./pages/tables/TablesPage";
import { UsersPage } from "./pages/users/UsersPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/forgot-password" element={<ForgotPasswordPage />} />

				{/* Rotte Protette dal Layout */}
				<Route element={<AppLayout />}>
					<Route path="/" element={<DashboardPage />} />

					{/* Players Routes */}
					<Route path="/players" element={<PlayersListPage />} />
					<Route path="/players/new" element={<PlayerCreatePage />} />

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
