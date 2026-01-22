import { AlertTriangle } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export const GlobalErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
	const errorMessage = error instanceof Error ? error.message : String(error);
	const errorStack = error instanceof Error ? error.stack : null;

	return (
		<div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-muted/30">
			<Card className="w-full max-w-md shadow-lg border-destructive/20 bg-card">
				<CardHeader className="text-center pb-2">
					<div className="flex justify-center mb-4">
						<div className="p-3 rounded-full bg-destructive/10">
							<AlertTriangle className="h-10 w-10 text-destructive" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold">Qualcosa è andato storto</CardTitle>
					<CardDescription>
						Si è verificato un errore imprevisto durante il rendering dell'applicazione.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					{import.meta.env.DEV && (
						<div className="mt-2 p-4 bg-muted rounded-md overflow-hidden">
							<p className="text-[10px] font-mono font-bold text-muted-foreground mb-2 uppercase tracking-wider">
								Dettagli Errore (Dev Mode):
							</p>
							<pre className="text-xs font-mono text-destructive overflow-auto max-h-48 whitespace-pre-wrap">
								{errorMessage || "Errore sconosciuto"}
								{errorStack && `\n\n${errorStack}`}
							</pre>
						</div>
					)}
				</CardContent>
				<CardFooter className="flex justify-center pt-2">
					<Button onClick={resetErrorBoundary} size="lg" className="w-full font-semibold">
						Riprova
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};
