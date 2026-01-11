import { CreateMatchForm } from "@/features/matches/CreateMatchForm";

export const MatchesPage = () => {
	return (
		<div className="space-y-8">
			<div className="text-center space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Partite</h1>
				<p className="text-gray-500">
					Registra una nuova sfida o visualizza lo storico.
				</p>
			</div>

			<CreateMatchForm />

			{/* Qui in futuro metteremo <MatchList /> per vedere lo storico */}
			<div className="text-center text-sm text-gray-400 mt-10">
				Lo storico delle partite sarà disponibile a breve.
			</div>
		</div>
	);
};
