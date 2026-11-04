import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import tls from "node:tls";
import * as schema from "./schema";
import { SUPABASE_ROOT_CA } from "./supabase-root-ca";

const { Pool } = pg;

// NOTE for Vercel deployments: this must be set as `DATABASE_URL` in the
// Vercel project's environment variables (not `VERCEL_DATABASE_URL`, which
// is only the name of the Replit secret holding the same value — Replit's
// own `DATABASE_URL` is a separate, internal-only dev database and must not
// be reused here).
const configuredUrl = process.env.DATABASE_URL?.trim();

// Don't crash the whole server when DATABASE_URL is missing — log it, let
// non-database routes keep working, and let /api/health/db report the problem.
export const databaseUrlMissing = !configuredUrl;
if (databaseUrlMissing) {
  console.error("DATABASE_URL is not set — database routes will fail until it is.");
}
const connectionString = configuredUrl || "postgresql://missing-database-url.invalid:5432/none";

// Vercel (and other serverless platforms) run this module fresh per
// invocation with no persistent process, so the pool must stay small and
// release connections quickly. A long-running server (e.g. this app's dev
// process on Replit) can safely hold more connections open.
const isServerless = Boolean(process.env.VERCEL);

// Respect an explicit `sslmode=disable` (used by Replit's internal dev
// database, which isn't reachable over TLS). Any other connection string —
// including external providers like Supabase/Neon — is assumed to require
// TLS, since that's the common case for externally hosted Postgres.
const sslDisabled = connectionString.includes("sslmode=disable");

export const pool = new Pool({
  connectionString,
  max: isServerless ? 3 : 10,
  idleTimeoutMillis: isServerless ? 10_000 : 30_000,
  connectionTimeoutMillis: 10_000,
  // Certificates are fully verified (default `rejectUnauthorized: true`) —
  // never disable verification, since that allows a MITM to intercept the
  // connection and its credentials. Node's default trusted root list covers
  // most externally hosted Postgres providers; Supabase's root CA is added
  // on top (not in place of) that list since Supabase issues certs from its
  // own private CA that isn't in the public trust stores.
  ssl: sslDisabled
    ? false
    : { ca: [...tls.rootCertificates, SUPABASE_ROOT_CA] },
});

// Without an error listener, an unexpected error on an idle client (e.g. the
// database terminating a connection) is an uncaught exception that crashes
// the whole process. Log it instead so a transient connection drop doesn't
// take the server down.
pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

export const db = drizzle(pool, { schema });

export * from "./schema";
