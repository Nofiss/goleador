import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Eye, FileText, Save, X } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { updateTournamentRules } from "@/api/tournaments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import type { TournamentDetail } from "@/types";

interface RulesTabProps {
	tournament: TournamentDetail;
}

export const RulesTab = ({ tournament }: RulesTabProps) => {
	const { isAdmin } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [rules, setRules] = useState(tournament.rules || "");
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (newRules: string) => updateTournamentRules(tournament.id, newRules),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tournament", tournament.id] });
			setIsEditing(false);
		},
	});

	const handleSave = () => {
		mutation.mutate(rules);
	};

	const handleCancel = () => {
		setRules(tournament.rules || "");
		setIsEditing(false);
	};

	if (isEditing) {
		return (
			<Card className="border-none shadow-none bg-transparent">
				<CardHeader className="px-0 flex flex-row items-center justify-between">
					<CardTitle className="text-xl">Modifica Regole</CardTitle>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={handleCancel}
							disabled={mutation.isPending}
						>
							<X className="mr-2 h-4 w-4" />
							Annulla
						</Button>
						<Button size="sm" onClick={handleSave} loading={mutation.isPending}>
							<Save className="mr-2 h-4 w-4" />
							Salva
						</Button>
					</div>
				</CardHeader>
				<CardContent className="px-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
							<Edit2 className="h-4 w-4" />
							Editor (Markdown)
						</div>
						<Textarea
							value={rules}
							onChange={(e) => setRules(e.target.value)}
							placeholder="Inserisci le regole del torneo qui... Supporta Markdown!"
							className="min-h-[500px] font-mono text-sm resize-none"
						/>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
							<Eye className="h-4 w-4" />
							Anteprima Live
						</div>
						<div className="min-h-[500px] p-4 border rounded-md bg-muted/10 overflow-auto">
							<div className="prose prose-slate max-w-none dark:prose-invert">
								{rules ? (
									<ReactMarkdown remarkPlugins={[remarkGfm]}>{rules}</ReactMarkdown>
								) : (
									<p className="text-muted-foreground italic">Nessuna anteprima disponibile.</p>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-none shadow-none bg-transparent">
			<CardHeader className="px-0 flex flex-row items-center justify-between">
				<CardTitle className="text-xl">Regole del Torneo</CardTitle>
				{isAdmin && (
					<Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
						<Edit2 className="mr-2 h-4 w-4" />
						Modifica Regole
					</Button>
				)}
			</CardHeader>
			<CardContent className="px-0">
				{tournament.rules ? (
					<div className="prose prose-slate max-w-none dark:prose-invert bg-card p-6 rounded-2xl border border-border/50">
						<ReactMarkdown remarkPlugins={[remarkGfm]}>{tournament.rules}</ReactMarkdown>
					</div>
				) : (
					<EmptyState
						icon={FileText}
						title="Nessuna regola definita"
						description="L'amministratore non ha ancora inserito le regole per questo torneo."
					/>
				)}
			</CardContent>
		</Card>
	);
};
