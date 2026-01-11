import {
	Gamepad2,
	LayoutDashboard,
	LogIn,
	LogOut,
	Trophy,
	Users,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const AppLayout = () => {
	const { isAuthenticated, logout } = useAuth();

	const navigation = [
		{ name: "Dashboard", href: "/", icon: LayoutDashboard },
		{ name: "Giocatori", href: "/players", icon: Users },
		{ name: "Partite", href: "/matches", icon: Gamepad2 }, // Placeholder
		{ name: "Tornei", href: "/tournaments", icon: Trophy }, // Placeholder
	];

	return (
		<div className="flex h-screen bg-gray-100">
			{/* Sidebar Laterale */}
			<aside className="w-64 bg-white border-r shadow-sm flex flex-col md:flex">
				<div className="p-6 border-b flex items-center justify-center">
					<h1 className="text-2xl font-extrabold text-blue-600 tracking-wider">
						GOLEADOR<span className="text-gray-900">.</span>
					</h1>
				</div>

				<nav className="flex-1 p-4 space-y-1">
					{navigation.map((item) => (
						<NavLink
							key={item.name}
							to={item.href}
							className={({ isActive }) =>
								cn(
									"flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
									isActive
										? "bg-blue-50 text-blue-700 border-r-4 border-blue-600"
										: "text-gray-700 hover:bg-gray-50 hover:text-gray-900",
								)
							}
						>
							<item.icon className="mr-3 h-5 w-5" />
							{item.name}
						</NavLink>
					))}
				</nav>

				<div className="mt-auto p-4 border-t">
					{isAuthenticated ? (
						<Button
							variant="ghost"
							className="w-full justify-start text-red-600"
							onClick={logout}
						>
							<LogOut className="mr-2 h-4 w-4" /> Logout
						</Button>
					) : (
						<Button variant="ghost" className="w-full justify-start" asChild>
							<Link to="/login">
								<LogIn className="mr-2 h-4 w-4" /> Login
							</Link>
						</Button>
					)}
				</div>

				<div className="p-4 border-t text-xs text-center text-gray-400">
					v1.0.0 - Internal Tool
				</div>
			</aside>

			{/* Area Contenuto Principale */}
			<main className="flex-1 overflow-y-auto">
				<div className="p-8">
					{/* Qui verranno renderizzate le pagine figlie (Dashboard, Players, ecc.) */}
					<Outlet />
				</div>
			</main>
		</div>
	);
};
