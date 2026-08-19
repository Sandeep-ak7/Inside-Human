import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  const bindings = env as unknown as { DB?: D1Database };
  if (!bindings.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure the `d1` binding or let your environment inject the real binding values before using the database."
    );
  }

  return drizzle(bindings.DB, { schema });
}
