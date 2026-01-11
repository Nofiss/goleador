import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { DashboardPage } from "@/pages/DashboardPage";
import { PlayersPage } from "@/pages/PlayersPage";
import { MatchesPage } from "./pages/MatchesPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Il Layout avvolge tutte le rotte interne */}
        <Route element={<AppLayout />}>
          
          {/* Rotta Default: Dashboard */}
          <Route path="/" element={<DashboardPage />} />
          
          {/* Rotta Players */}
          <Route path="/players" element={<PlayersPage />} />
          
          <Route path="/matches" element={<MatchesPage />} /> 

          <Route path="/tournaments" element={<div>Pagina Tornei (Coming Soon)</div>} />

        </Route>

        {/* Catch all: se uno scrive un URL a caso, rimanda alla home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;