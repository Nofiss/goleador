import { Loader2 } from "lucide-react";

export const PageLoader = () => {
	return (
		<div className="flex flex-col items-center justify-center h-screen w-full gap-2">
			<Loader2 className="h-8 w-8 animate-spin text-primary" />
			<span className="text-muted-foreground animate-pulse">Caricamento...</span>
		</div>
	);
};
