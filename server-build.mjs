// Pre-bundles `server.ts` into a single self-contained `server.js` at the
// repo root, before Vercel's zero-config Node.js backend support ever sees
// it.
//
// Why this exists: Vercel's zero-config Node backend transpiles a TS
// entrypoint file-by-file (mirroring the source tree) rather than bundling
// it into one file. That transpile does not rewrite relative import
// specifiers to add explicit extensions, so `import app from
// "./artifacts/api-server/src/app"` reaches the Node ESM runtime unchanged
// -- and Node's ESM resolver (unlike TS's "bundler" resolution used for
// local dev/typecheck) requires relative imports to include their file
// extension. The result is `ERR_MODULE_NOT_FOUND` at runtime for every
// request, even though the build itself "succeeds".
//
// Bundling here with esbuild (bundle: true) inlines every local/workspace
// relative import into one file ahead of time, so there are no local
// relative imports left for Node's runtime resolver to choke on -- only
// bare package specifiers (e.g. "express"), which Node resolves via
// node_modules regardless of extensions. This also means Vercel's own
// transpile step becomes a no-op passthrough (the input is already plain,
// valid ESM JS), so this whole class of bug can't recur even if new files
// are added under artifacts/api-server or lib/db without a `.js` extension
// on their relative imports.
//
// This mirrors the same esbuild bundling pattern already used by
// artifacts/api-server/build.mjs (same external list, same pino handling)
// since server.ts re-exports that same Express app.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

// The pino plugin uses `require` to resolve dependencies.
globalThis.require = createRequire(import.meta.url);

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

async function buildServer() {
  const outfile = path.resolve(repoRoot, "server.js");
  await rm(outfile, { force: true });
  await rm(`${outfile}.map`, { force: true });

  await esbuild({
    entryPoints: [path.resolve(repoRoot, "server.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    // esbuild-plugin-pino emits extra worker-thread entry points (pino's
    // transports run off the main thread), which esbuild only allows
    // alongside an `outdir` (not a single `outfile`) -- hence outdir here.
    // Default entry naming turns entryPoints: ["server.ts"] into
    // "server.js" in that dir, right next to its sibling worker files.
    outdir: repoRoot,
    logLevel: "info",
    // Keep in sync with artifacts/api-server/build.mjs's external list --
    // packages that use native modules, dynamic/path-based requires, or are
    // otherwise unsafe to statically bundle. server.ts pulls in the same
    // Express app as that package, so the same set applies here.
    external: [
      // Keep express as a real import in server.js: Vercel's Express
      // detection scans the entrypoint for an `express` import and fails
      // the build ("No entrypoint found which imports express") if it's
      // been bundled inline. It's a root dependency, so it resolves at runtime.
      "express",
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],
    sourcemap: "linked",
    plugins: [
      // pino relies on worker threads for transports -- bundling those
      // naively breaks them, so this plugin handles emitting them as
      // separate worker files next to the bundle instead.
      esbuildPluginPino({ transports: ["pino-pretty"] }),
    ],
    // express/cors/cookie-parser/pino-http are CJS; this shim lets bundled
    // `require(...)` calls resolve correctly from within our ESM output.
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });
}

buildServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
