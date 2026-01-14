import {
	Gamepad2,
	LayoutDashboard,
	LogOut,
	Map as MapIcon,
	Menu,
	Trophy,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // Per mobile menu
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
	const { isAuthenticated, logout, isAdmin, roles } = useAuth();
	const navigate = useNavigate();
	const [isOpen, setIsOpen] = useState(false); // Mobile menu state

	const navigation = [
		{ name: "Dashboard", href: "/", icon: LayoutDashboard },
		{ name: "Partite", href: "/matches", icon: Gamepad2 },
		{ name: "Tornei", href: "/tournaments", icon: Trophy },
		{ name: "Giocatori", href: "/players", icon: Users },
		{ name: "Tavoli", href: "/tables", icon: MapIcon },
	];

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	return (
		<div className="min-h-screen bg-background flex flex-col">
			{/* Top Navbar */}
			<header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60">
				{/* Mobile Menu Trigger */}
				<Sheet open={isOpen} onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button variant="ghost" size="icon" className="md:hidden">
							<Menu className="h-5 w-5" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="w-60 sm:w-75">
						<div className="py-4">
							<Logo className="mb-6 px-2" />
							<nav className="flex flex-col gap-2">
								{navigation.map((item) => (
									<NavLink
										key={item.href}
										to={item.href}
										onClick={() => setIsOpen(false)}
										className={({ isActive }) =>
											cn(
												"flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
												isActive
													? "bg-primary/10 text-primary"
													: "hover:bg-accent hover:text-accent-foreground",
											)
										}
									>
										<item.icon className="h-4 w-4" />
										{item.name}
									</NavLink>
								))}
							</nav>
						</div>
					</SheetContent>
				</Sheet>

				{/* Desktop Logo */}
				<Link to="/" className="hidden md:flex">
					<Logo />
				</Link>

				{/* Desktop Navigation */}
				<nav className="hidden md:flex items-center gap-6 ml-6">
					{navigation.map((item) => (
						<NavLink
							key={item.href}
							to={item.href}
							className={({ isActive }) =>
								cn(
									"flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
									isActive ? "text-primary" : "text-muted-foreground",
								)
							}
						>
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
									className="relative h-9 w-9 rounded-full"
								>
									<Avatar className="h-9 w-9 border">
										<AvatarImage src="/avatars/01.png" alt="User" />
										<AvatarFallback className="bg-primary text-primary-foreground font-bold">
											{isAdmin ? "AD" : "RF"}
										</AvatarFallback>
									</Avatar>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none">Utente</p>
										<p className="text-xs leading-none text-muted-foreground">
											{roles.join(", ")}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={handleLogout}
									className="text-red-600 focus:text-red-600"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Esci
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Button asChild variant="default" size="sm">
							<Link to="/login">Accedi</Link>
						</Button>
					)}
				</div>
			</header>

			{/* Main Content Area */}
			<main className="flex-1 container mx-auto p-6 md:p-8 max-w-7xl">
				<Outlet />
			</main>
		</div>
	);
};
