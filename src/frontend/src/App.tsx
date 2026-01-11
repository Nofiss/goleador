import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoginPage } from "@/pages/LoginPage";
// Matches
import { MatchCreatePage } from "@/pages/matches/MatchCreatePage";
import { MatchesListPage } from "@/pages/matches/MatchesListPage";
import { PlayerCreatePage } from "@/pages/players/PlayerCreatePage";
// Players
import { PlayersListPage } from "@/pages/players/PlayersListPage";
import { TournamentCreatePage } from "@/pages/tournaments/TournamentCreatePage";
import { TournamentDetailPage } from "@/pages/tournaments/TournamentDetailPage";
// Tournaments
import { TournamentsListPage } from "@/pages/tournaments/TournamentsListPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginPage />} />

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
				</Route>

				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
