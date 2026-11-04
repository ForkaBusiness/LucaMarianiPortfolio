import { Router } from "express";
import { db, mediaTable } from "@workspace/db";
import { and, asc, desc, eq } from "drizzle-orm";

const router = Router();

// Public: active media for the site.
//   GET /api/media?kind=video            -> all visible videos
//   GET /api/media?kind=photo            -> all visible photos
//   GET /api/media?kind=photo&featured=1 -> homepage gallery photos
router.get("/media", async (req, res) => {
  const kind = req.query.kind === "photo" ? "photo" : "video";
  const featuredOnly = req.query.featured === "1";

  try {
    const conditions = [eq(mediaTable.kind, kind), eq(mediaTable.active, true)];
    if (featuredOnly) conditions.push(eq(mediaTable.featured, true));

    const items = await db
      .select()
      .from(mediaTable)
      .where(and(...conditions))
      .orderBy(
        // Homepage gallery: most recently added first. Pages: portal order.
        ...(featuredOnly
          ? [desc(mediaTable.createdAt), asc(mediaTable.id)]
          : [asc(mediaTable.category), asc(mediaTable.position), asc(mediaTable.id)]),
      );

    // Short CDN cache so edits in the portal show up within a minute,
    // without hitting the database on every page view.
    res.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=60");
    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch media");
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

export default router;
