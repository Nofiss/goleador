import logoDark from "@/assets/cs-negative-ld.png";
import logoLight from "@/assets/cs-normal-shadow-ld.png";

import { cn } from "@/lib/utils";

interface LogoProps {
	className?: string;
}

export const Logo = ({ className }: LogoProps) => {
	return (
		<div
			className={cn(
				"flex items-center gap-3 font-extrabold text-xl tracking-tighter",
				className,
			)}
		>
			<img
				src={logoLight}
				alt="Goleador Logo"
				className="w-20 h-20 object-contain dark:hidden"
			/>

			{/* Logo per tema Dark: nascosto di default, visibile solo in dark mode */}
			<img
				src={logoDark}
				alt="Goleador Logo"
				className="hidden w-20 h-20 object-contain dark:block"
			/>
			<span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">
				GOLEADOR
			</span>
		</div>
	);
};
