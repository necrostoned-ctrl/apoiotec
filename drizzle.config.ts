import "dotenv/config"; // <--- ESTA LINHA É A MAIS IMPORTANTE!
import { defineConfig } from "drizzle-kit";

// Se o erro "DATABASE_URL, ensure..." aparecer, o código para aqui
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});