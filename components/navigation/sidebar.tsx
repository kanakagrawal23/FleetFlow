"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	LayoutDashboard,
	Truck,
	Map,
	Wrench,
	DollarSign,
	Users,
	BarChart3,
	LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth/auth-client";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "driver", "dispatcher", "safety", "analyst"] },
	{ name: "Vehicles", href: "/vehicles", icon: Truck, roles: ["admin", "manager"] },
	{ name: "Trips", href: "/trips", icon: Map, roles: ["admin", "manager", "dispatcher"] },
	{ name: "Maintenance", href: "/maintenance", icon: Wrench, roles: ["admin", "manager"] },
	{ name: "Expenses", href: "/expenses", icon: DollarSign, roles: ["admin", "manager", "driver"] },
	{ name: "Drivers", href: "/drivers", icon: Users, roles: ["admin", "manager"] },
	{ name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "manager", "analyst"] },
];

export default function Sidebar() {
	const pathname = usePathname();
	const { data: session } = authClient.useSession();

	const userRole = session?.user?.role as string;
	const allowedNavItems = navigation.filter(item => 
		item.roles.includes(userRole) || item.roles.includes("admin")
	);

	const handleLogout = async () => {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = "/login";
				},
			},
		});
	};

	return (
		<div className="flex h-screen w-64 flex-col border-r bg-background">
			<div className="flex h-16 items-center border-b px-6">
				<h1 className="text-xl font-bold">FleetFlow</h1>
			</div>

			<nav className="flex-1 space-y-1 p-4">
				{allowedNavItems.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.name}
							href={item.href}
							className={cn(
								"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
							)}
						>
							<item.icon className="size-5" />
							{item.name}
						</Link>
					);
				})}
			</nav>

			<div className="border-t p-4">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
						{session?.user?.name?.charAt(0).toUpperCase()}
					</div>
					<div className="flex-1">
						<p className="text-sm font-medium">{session?.user?.name}</p>
						<p className="text-xs text-muted-foreground">{session?.user?.role}</p>
					</div>
				</div>
				<Button variant="outline" className="w-full" onClick={handleLogout}>
					<LogOut className="mr-2 size-4" />
					Sign Out
				</Button>
			</div>
		</div>
	);
}
