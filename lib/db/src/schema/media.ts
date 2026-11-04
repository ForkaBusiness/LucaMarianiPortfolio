import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

// Every video on /videography and every photo on /photography (and the
// homepage gallery, via `featured`) lives in this one table so the portal
// can manage the whole site without code changes.
export const mediaTable = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(), // "video" | "photo"
    category: text("category").notNull(), // see VIDEO_CATEGORIES / PHOTO_CATEGORIES
    title: text("title").notNull().default(""),
    src: text("src").notNull(), // video: YouTube embed URL · photo: image URL
    artist: text("artist"), // optional tag shown on photos (e.g. "LORD HURON")
    aspect: text("aspect").notNull().default("16/9"), // videos: "16/9" | "9/16"
    position: integer("position").notNull().default(0), // lower = earlier
    featured: boolean("featured").notNull().default(false), // photos: show in homepage gallery
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("media_kind_category_position_idx").on(t.kind, t.category, t.position)],
);

export const MEDIA_KINDS = ["video", "photo"] as const;
export const VIDEO_CATEGORIES = ["music", "sports", "snow", "hospitality"] as const;
export const PHOTO_CATEGORIES = ["music", "snow", "sports", "event"] as const;

export function isValidCategory(kind: string, category: string): boolean {
  const list: readonly string[] = kind === "video" ? VIDEO_CATEGORIES : PHOTO_CATEGORIES;
  return list.includes(category);
}

const httpsUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => {
    try {
      return new URL(v).protocol === "https:";
    } catch {
      return false;
    }
  }, "Must be an https:// link");

const mediaFields = {
  kind: z.enum(MEDIA_KINDS),
  category: z.string().trim().min(1).max(40),
  title: z.string().trim().max(200),
  src: httpsUrl,
  artist: z.string().trim().max(100).nullable(),
  aspect: z.enum(["16/9", "9/16"]),
  featured: z.boolean(),
  active: z.boolean(),
};

export const insertMediaSchema = z.object({
  ...mediaFields,
  title: mediaFields.title.default(""),
  artist: mediaFields.artist.optional(),
  aspect: mediaFields.aspect.default("16/9"),
  featured: mediaFields.featured.default(false),
  active: mediaFields.active.default(true),
});

export const updateMediaSchema = z.object(mediaFields).partial();

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type UpdateMedia = z.infer<typeof updateMediaSchema>;
export type Media = typeof mediaTable.$inferSelect;

export const insertMediaListSchema = z.array(insertMediaSchema);
export const reorderMediaSchema = z.object({ ids: z.array(z.number().int()).min(1).max(1000) });
