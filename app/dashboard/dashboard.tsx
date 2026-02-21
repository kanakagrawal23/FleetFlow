"use client";
import { authClient } from "@/lib/auth/auth-client";

export default function Dashboard({ session }: { session: typeof authClient.$Infer.Session }) {
	return <>
	<div 
		className="w-full h-[300px] overflow-hidden relative"
	>
		<iframe 
			title="main" 
			className="w-full h-[370px] border-none"
			src="https://app.powerbi.com/view?r=eyJrIjoiMWQ0YmYxODMtZGZjZC00ZWZhLWFhMzktNzE4N2E3OGE4NjhmIiwidCI6ImJhNGRhNDJmLWI4M2ItNGNiNy1hZDM2LTAxNzJkNzZhNzBhNyJ9"
			frameBorder={0} 
			allowFullScreen={true}>
		</iframe>
	</div>
	</>;
}
