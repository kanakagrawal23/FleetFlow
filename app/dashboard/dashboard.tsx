"use client";
import { authClient } from "@/lib/auth/auth-client";

export default function Dashboard({ session }: { session: typeof authClient.$Infer.Session }) {
	return <>
		<iframe 
			title="main" 
			className="w-full h-[40%]"
			src="https://app.powerbi.com/view?r=eyJrIjoiYjNhOTY1NmItNWE2Ni00YmQ4LWIyOTAtNmI0Y2JjYzNiMDM2IiwidCI6ImJhNGRhNDJmLWI4M2ItNGNiNy1hZDM2LTAxNzJkNzZhNzBhNyJ9" 
			frameBorder={0} 
			allowFullScreen={true}>
		</iframe>
	</>;
}
