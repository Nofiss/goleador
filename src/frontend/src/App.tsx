import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { PlayersPage } from "@/pages/PlayersPage";
import { TournamentDetailPage } from "@/pages/TournamentDetailPage";
import { TournamentsPage } from "@/pages/TournamentsPage";
import { LoginPage } from "./pages/LoginPage";
import { MatchesPage } from "./pages/MatchesPage";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Il Layout avvolge tutte le rotte interne */}
				<Route element={<AppLayout />}>
					{/* Rotta Default: Dashboard */}
					<Route path="/" element={<DashboardPage />} />

					<Route path="/login" element={<LoginPage />} />

					{/* Rotta Players */}
					<Route path="/players" element={<PlayersPage />} />

					<Route path="/matches" element={<MatchesPage />} />

					<Route path="/tournaments" element={<TournamentsPage />} />
					<Route path="/tournaments/:id" element={<TournamentDetailPage />} />
				</Route>

				{/* Catch all: se uno scrive un URL a caso, rimanda alla home */}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
