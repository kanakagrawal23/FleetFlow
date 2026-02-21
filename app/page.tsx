"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Truck, Map, Wrench, DollarSign, Users, BarChart3, LogIn } from "lucide-react";

const navigation = [
	{ name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "manager", "driver", "dispatcher", "safety", "analyst"] },
	{ name: "Vehicles", href: "/vehicles", icon: Truck, roles: ["admin", "manager"] },
	{ name: "Trips", href: "/trips", icon: Map, roles: ["admin", "manager", "dispatcher"] },
	{ name: "Maintenance", href: "/maintenance", icon: Wrench, roles: ["admin", "manager"] },
	{ name: "Expenses", href: "/expenses", icon: DollarSign, roles: ["admin", "manager", "driver"] },
	{ name: "Drivers", href: "/drivers", icon: Users, roles: ["admin", "manager"] },
	{ name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "manager", "analyst"] },
];

export default function Home() {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	const userRole = session?.user?.role as string;
	const allowedNavItems = navigation.filter(item => 
		item.roles.includes(userRole) || !session
	);

	useEffect(() => {
		if (!isPending && session) {
			router.push("/dashboard");
		}
	}, [session, isPending, router]);

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			{/* Navbar */}
			<header className="border-b bg-background">
				<div className="container mx-auto flex h-16 items-center justify-between px-4">
					<div className="flex items-center gap-8">
						<Link href="/" className="text-xl font-bold">FleetFlow</Link>
						<nav className="hidden md:flex gap-6">
							{allowedNavItems.map((link) => (
								<Link
									key={link.name}
									href={link.href}
									className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
								>
									<link.icon className="size-4" />
									{link.name}
								</Link>
							))}
						</nav>
					</div>
					<div className="flex items-center gap-4">
						{session ? (
							<Link href="/dashboard">
								<Button>Go to Dashboard</Button>
							</Link>
						) : (
							<Link href="/login">
								<Button>
									<LogIn className="mr-2 size-4" />
									Sign In
								</Button>
							</Link>
						)}
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<main className="container mx-auto px-4 py-16">
				<div className="mx-auto max-w-3xl text-center">
					<h1 className="mb-4 text-4xl font-bold">Welcome to FleetFlow</h1>
					<p className="mb-8 text-lg text-muted-foreground">
						Comprehensive fleet management system for tracking vehicles, trips, drivers, and expenses.
					</p>
					{!session && (
						<div className="flex justify-center gap-4">
							<Link href="/login">
								<Button size="lg">Get Started</Button>
							</Link>
						</div>
					)}

					{/* Features Grid */}
					<div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{[
							{ title: "Vehicle Registry", desc: "Manage your fleet vehicles", icon: Truck },
							{ title: "Trip Dispatcher", desc: "Create and track trips", icon: Map },
							{ title: "Maintenance", desc: "Service logs and alerts", icon: Wrench },
							{ title: "Expenses", desc: "Track fuel and costs", icon: DollarSign },
							{ title: "Drivers", desc: "Manage driver information", icon: Users },
							{ title: "Analytics", desc: "Operational insights", icon: BarChart3 },
						].map((feature) => (
							<div key={feature.title} className="rounded-lg border bg-card p-6 text-left">
								<feature.icon className="mb-3 size-6 text-primary" />
								<h3 className="mb-1 font-semibold">{feature.title}</h3>
								<p className="text-sm text-muted-foreground">{feature.desc}</p>
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
