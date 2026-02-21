import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	className?: string;
}

export default function KpiCard({ title, value, icon: Icon, trend, className }: KpiCardProps) {
	return (
		<div className={cn("rounded-lg border bg-card p-6 shadow-sm", className)}>
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">{title}</p>
					<p className="mt-2 text-3xl font-bold">{value}</p>
					{trend && (
						<p
							className={cn(
								"mt-2 flex items-center text-xs",
								trend.isPositive ? "text-green-600" : "text-red-600"
							)}
						>
							{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
							<span className="ml-1 text-muted-foreground">from last month</span>
						</p>
					)}
				</div>
				<div className="rounded-lg bg-primary/10 p-3">
					<Icon className="size-6 text-primary" />
				</div>
			</div>
		</div>
	);
}
