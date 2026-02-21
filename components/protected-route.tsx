"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "@/components/loader";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: Array<"admin" | "manager" | "driver" | "dispatcher" | "safety" | "analyst">;
}

type UserRole = "admin" | "manager" | "driver" | "dispatcher" | "safety" | "analyst";

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
	const { data: session, isPending } = authClient.useSession();
	const router = useRouter();

	useEffect(() => {
		if (!isPending && !session) {
			router.push("/login");
		}

		if (!isPending && session?.user?.role && allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
			router.push("/dashboard");
		}
	}, [session, isPending, router, allowedRoles]);

	if (isPending) {
		return <Loader />;
	}

	if (!session) {
		return null;
	}

	if (allowedRoles && !allowedRoles.includes(session.user.role as UserRole)) {
		return null;
	}

	return <>{children}</>;
}
