import logoDark from "@/assets/cs-negative-ld.png";
import logoLight from "@/assets/cs-normal-shadow-ld.png";
import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
	variant?: "horizontal" | "vertical";
	size?: "sm" | "md" | "lg";
	showText?: boolean;
}

export const AppLogo = ({
	className,
	variant = "horizontal",
	size = "md",
	showText = true,
}: LogoProps) => {
	const sizes = {
		sm: "w-10 h-10",
		md: "w-16 h-16",
		lg: "w-24 h-24",
	};

	const textSizes = {
		sm: "text-lg",
		md: "text-2xl",
		lg: "text-4xl",
	};

	return (
		<div
			className={cn(
				"flex items-center gap-3",
				variant === "vertical" ? "flex-col text-center" : "flex-row",
				className,
			)}
		>
			<div className={cn("relative", sizes[size])}>
				<img
					src={logoLight}
					alt="Goleador Logo"
					className="w-full h-full object-contain dark:hidden"
				/>
				<img
					src={logoDark}
					alt="Goleador Logo"
					className="hidden w-full h-full object-contain dark:block"
				/>
			</div>

			{showText && (
				<span
					className={cn(
						"font-extrabold tracking-tighter bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600",
						textSizes[size],
					)}
				>
					GOLEADOR
				</span>
			)}
		</div>
	);
};
