import { QueryClient, QueryClientProvider, QueryErrorResetBoundary } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";
import App from "./App.tsx";
import { GlobalErrorFallback } from "./components/errors/GlobalErrorFallback.tsx";
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
			<QueryErrorResetBoundary>
				{({ reset }) => (
					<ErrorBoundary
						onReset={reset}
						FallbackComponent={(props) => (
							<div className="min-h-screen flex flex-col">
								<GlobalErrorFallback {...props} />
							</div>
						)}
					>
						<ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
							<App />
							<Toaster position="top-center" richColors />
						</ThemeProvider>
					</ErrorBoundary>
				)}
			</QueryErrorResetBoundary>
		</QueryClientProvider>
	</StrictMode>,
);
