import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db, databaseUrlMissing } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Plain-English database diagnostics. Never includes the password.
function describeUrl() {
  try {
    const u = new URL(process.env.DATABASE_URL ?? "");
    return {
      host: u.hostname,
      port: u.port || "5432",
      user: decodeURIComponent(u.username),
      usingTransactionPooler: u.hostname.endsWith("pooler.supabase.com") && u.port === "6543",
      passwordHasBrackets: /^\[.*\]$/.test(decodeURIComponent(u.password)),
    };
  } catch {
    return { host: "(DATABASE_URL is not a valid URL)" };
  }
}

function hintFor(err: unknown): string {
  const e = err as { code?: string; message?: string; cause?: { code?: string; message?: string } };
  const code = e?.cause?.code ?? e?.code ?? "";
  const msg = `${e?.cause?.message ?? ""} ${e?.message ?? ""}`;
  if (code === "28P01" || /password authentication failed/i.test(msg)) return "Wrong database password in DATABASE_URL.";
  if (/tenant or user not found/i.test(msg)) return "Username is wrong — with the pooler it must be postgres.<project-ref>.";
  if (code === "42P01") return "Connected, but the tables don't exist in THIS database — run the setup SQL in this project.";
  if (["ENOTFOUND", "EAI_AGAIN"].includes(code)) return "Host not found — copy the Transaction pooler string again.";
  if (["ENETUNREACH", "EHOSTUNREACH"].includes(code)) return "Can't reach the direct connection from Vercel — use the Transaction pooler string (port 6543).";
  if (code === "ETIMEDOUT" || /timeout/i.test(msg)) return "Connection timed out — check host/port, or the Supabase project may be paused.";
  if (/certificate|self.signed|SSL/i.test(msg)) return "TLS/certificate problem connecting to the database.";
  return "Unknown error — send this whole page to Claude.";
}

router.get("/health/db", async (_req, res) => {
  res.set("Cache-Control", "no-store");
  if (databaseUrlMissing) {
    res.status(500).json({ ok: false, problem: "DATABASE_URL is not set in Vercel (or the deploy predates adding it)." });
    return;
  }
  try {
    const result = await db.execute(
      sql`select (select count(*) from media)::int as media, (select count(*) from recent_work)::int as recent_work`,
    );
    res.json({ ok: true, connection: describeUrl(), rows: result.rows[0] });
  } catch (err) {
    const e = err as { code?: string; cause?: { code?: string } };
    res.status(500).json({
      ok: false,
      problem: hintFor(err),
      errorCode: e?.cause?.code ?? e?.code ?? null,
      connection: describeUrl(),
    });
  }
});

export default router;
