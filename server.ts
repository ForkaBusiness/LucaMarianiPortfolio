// Vercel's zero-config Node.js backend support detects this file as the
// app entrypoint (it matches one of the recognized filenames — `server.ts`
// at the project root — and imports the `express` framework), bundles it
// as a single Lambda, and routes every request to it with the original
// path/query intact. No `api/` folder or `vercel.json` rewrites are
// involved, which avoids the path-mangling pitfalls of the older
// filesystem-routed `api/*.ts` convention.
//
// Locally (via `pnpm dev`) this same file isn't used — the dev workflow
// runs `artifacts/api-server`'s own build/start scripts directly — but it
// must still import the real app so Vercel serves the identical API.
import path from "node:path";
import express from "express";
import app from "./artifacts/api-server/src/app";

// Vercel serves anything under `public/` directly from its CDN before a
// request ever reaches this function, so `express.static` here only
// matters when this file is run outside Vercel (e.g. local simulation).
const publicDir = path.join(process.cwd(), "public");
app.use(express.static(publicDir, { index: false }));

// A request for a missing file (e.g. an old /assets/index-abc.js that a
// cached page still references after a redeploy) must 404 — answering it
// with index.html makes the browser fail with "'text/html' is not a valid
// JavaScript MIME type" and the page renders blank.
app.get(/^\/(assets\/.*|.*\.[a-z0-9]{2,5})$/i, (_req, res) => {
  res.status(404).set("Cache-Control", "no-store").send("Not found");
});

// Any other GET (including "/") is a client-side (SPA) route — serve the
// app shell. The shell is never cached so a redeploy is picked up on the
// next visit.
app.get(["/", "/*splat"], (_req, res) => {
  res.set("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(path.join(publicDir, "index.html"));
});

export default app;
