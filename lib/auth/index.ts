import { db } from "../db/index";
import * as schema from "../db/schema/index";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",

		schema: schema,
	}),
	trustedOrigins: [process.env.CORS_ORIGIN!],
	emailAndPassword: {
		enabled: true,
	},
	plugins: [nextCookies()],
});
