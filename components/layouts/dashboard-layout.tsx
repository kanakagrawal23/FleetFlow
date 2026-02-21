"use client";

import Sidebar from "@/components/navigation/sidebar";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className="flex h-screen overflow-hidden">
			<Sidebar />
			<main className="flex-1 overflow-y-auto bg-background">{children}</main>
		</div>
	);
}
