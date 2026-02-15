import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

/**
 * Componente riutilizzabile per gli stati vuoti (Empty States).
 * Segue il pattern di design del progetto: bordo tratteggiato, sfondo tenue e icona centrata.
 */
export const EmptyState = ({
	icon: Icon,
	title,
	description,
	action,
	className,
}: EmptyStateProps) => {
	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
			className={cn(
				"flex flex-col items-center justify-center py-12 px-6 border-2 border-dashed rounded-[2rem] bg-muted/5 border-muted-foreground/20 text-center",
				className,
			)}
		>
			<div className="relative mb-4">
				<div className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-xl scale-150 opacity-50" />
				<Icon className="relative h-12 w-12 text-muted-foreground/30" aria-hidden="true" />
			</div>

			<h3 className="text-xl font-bold text-foreground/80 tracking-tight">{title}</h3>

			{description && (
				<p className="text-sm text-muted-foreground mt-2 max-w-[280px] leading-relaxed">
					{description}
				</p>
			)}

			{action && (
				<div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300 fill-mode-both">
					{action}
				</div>
			)}
		</motion.div>
	);
};
