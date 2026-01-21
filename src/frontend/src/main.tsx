import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";
import "./globals.css";

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error(
		"Impossibile trovare l'elemento root. Assicurati che sia presente nell'index.html",
	);
}

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
				<App />
			</ThemeProvider>
		</QueryClientProvider>
	</StrictMode>,
);
