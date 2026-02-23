import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ScoreStepperProps {
	value: number;
	onChange: (value: number) => void;
	label: string;
	className?: string;
	colorClass?: "blue" | "red" | "default";
}

export const ScoreStepper = ({
	value,
	onChange,
	label,
	className,
	colorClass = "default",
}: ScoreStepperProps) => {
	const handleDecrement = () => {
		onChange(Math.max(0, value - 1));
	};

	const handleIncrement = () => {
		onChange(value + 1);
	};

	const getColors = () => {
		switch (colorClass) {
			case "blue":
				return "focus-visible:ring-blue-500/50 border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/10 hover:bg-blue-500/10 hover:text-blue-600";
			case "red":
				return "focus-visible:ring-red-500/50 border-red-500/20 bg-red-500/5 dark:bg-red-500/10 hover:bg-red-500/10 hover:text-red-600";
			default:
				return "";
		}
	};

	const colors = getColors();

	return (
		<div className={cn("flex items-center gap-2", className)}>
			<Button
				type="button"
				variant="outline"
				size="icon"
				className={cn(
					"h-10 w-10 rounded-full shrink-0 transition-transform active:scale-90",
					colors,
				)}
				onClick={handleDecrement}
				aria-label={`Diminuisci ${label}`}
				title={`Diminuisci ${label}`}
			>
				<Minus className="h-5 w-5" />
			</Button>

			<Input
				type="number"
				min="0"
				aria-label={label}
				title={label}
				className={cn(
					"text-4xl md:text-5xl font-mono text-center h-16 md:h-20 w-full",
					colors
						.split(" ")
						.filter((c) => c.startsWith("focus") || c.startsWith("border") || c.includes("bg-"))
						.join(" "),
				)}
				value={value}
				onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
			/>

			<Button
				type="button"
				variant="outline"
				size="icon"
				className={cn(
					"h-10 w-10 rounded-full shrink-0 transition-transform active:scale-90",
					colors,
				)}
				onClick={handleIncrement}
				aria-label={`Aumenta ${label}`}
				title={`Aumenta ${label}`}
			>
				<Plus className="h-5 w-5" />
			</Button>
		</div>
	);
};
