import { QueryErrorResetBoundary } from "@tanstack/react-query";
import {
	LayoutDashboard,
	LogOut,
	Map as MapIcon,
	Menu,
	ShieldCheck,
	TrendingUp,
	Trophy,
	Users,
} from "lucide-react";
import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { AppLogo } from "@/components/AppLogo";
import { GlobalErrorFallback } from "@/components/errors/GlobalErrorFallback";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// AGGIUNTO: Importa SheetHeader, SheetTitle e SheetDescription
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
	const { isAuthenticated, logout, isAdmin, roles } = useAuth();
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false);

	const navigation = [
		{ name: "Dashboard", href: "/", icon: LayoutDashboard },
		// { name: "Ranking", href: "/ranking", icon: TrendingUp },
		//		{ name: "Partite", href: "/matches", icon: Gamepad2},
		{ name: "Tornei", href: "/tournaments", icon: Trophy },
		{ name: "Giocatori", href: "/players", icon: Users },
		{ name: "Tavoli", href: "/tables", icon: MapIcon },
		...(isAdmin ? [{ name: "Utenti", href: "/users", icon: ShieldCheck }] : []),
	];

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Top Navbar */}
			<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60">
				{/* Mobile Menu */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="md:hidden" aria-label="Apri menu">
							<Menu className="h-5 w-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-64">
						{/* SOLUZIONE ERRORE: Aggiunta di Header, Title e Description per accessibilità */}
						<SheetHeader className="text-left">
							<SheetTitle className="sr-only">Menu di Navigazione</SheetTitle>
							<SheetDescription className="sr-only">
								Accedi alle sezioni principali dell'applicazione
							</SheetDescription>
							<div className="px-2 mb-4">
								<AppLogo size="sm" />
							</div>
						</SheetHeader>

						<nav className="flex flex-col gap-2 mt-4">
							{navigation.map((item) => (
								<NavLink
									key={item.href}
									to={item.href}
									onClick={() => setIsOpen(false)}
									className={({ isActive }) =>
										cn(
											"flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all",
											isActive
												? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
												: "text-muted-foreground hover:bg-muted hover:text-foreground",
										)
									}
								>
									<item.icon className="h-4 w-4" />
									{item.name}
								</NavLink>
							))}
						</nav>
					</SheetContent>
				</Sheet>

				{/* Desktop Logo */}
				<Link to="/" className="hidden md:flex">
					<AppLogo size="md" />
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-1 ml-6">
					{navigation.map((item) => (
						<NavLink
							key={item.href}
							to={item.href}
							className={({ isActive }) =>
								cn(
									"flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-all rounded-md",
									isActive
										? "bg-muted text-primary"
										: "text-muted-foreground hover:text-foreground hover:bg-muted/50",
								)
							}
						>
							<item.icon className="h-4 w-4" />
							{item.name}
						</NavLink>
					))}
				</nav>

				<div className="ml-auto flex items-center gap-4">
					<ModeToggle />

					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									className="relative h-9 w-9 rounded-full ring-offset-background transition-all hover:ring-2 hover:ring-primary/20"
								>
									<Avatar className="h-9 w-9 border-2 border-border">
										<AvatarImage src="/avatars/01.png" alt="User" />
										<AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
											{isAdmin ? "AD" : "RF"}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-bold leading-none">Account</p>
										<p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
											{roles.join(" • ")}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30 focus:text-red-600 cursor-pointer"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Esci
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button
							asChild
							variant="default"
							size="sm"
							className="font-semibold shadow-lg shadow-primary/20"
						>
							<Link to="/login">Accedi</Link>
						</Button>
					)}
				</div>
			</header>

			{/* Main Content Area */}
			<main className="flex-1 container mx-auto p-4 md:p-8 max-w-7xl flex flex-col">
				<QueryErrorResetBoundary>
					{({ reset }) => (
						<ErrorBoundary onReset={reset} FallbackComponent={GlobalErrorFallback}>
							<Outlet />
						</ErrorBoundary>
					)}
				</QueryErrorResetBoundary>
			</main>
		</div>
	);
};
