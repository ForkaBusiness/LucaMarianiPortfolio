import { useQuery } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export type MediaKind = "video" | "photo";
export type Aspect = "16/9" | "9/16";

export type MediaItem = {
  id: number;
  kind: MediaKind;
  category: string;
  title: string;
  src: string;
  artist: string | null;
  aspect: Aspect;
  position: number;
  featured: boolean;
  active: boolean;
  createdAt: string;
};

// Section names/subtitles shown on the site. The `key` is what's stored in
// the database `category` column.
export const VIDEO_CATEGORIES = [
  { key: "music", label: "MUSIC", sub: "Concert films · Live performances · Artist narratives" },
  { key: "sports", label: "SPORTS", sub: "Athletic campaigns · Event coverage · Brand films" },
  { key: "snow", label: "SNOW", sub: "Alpine · Winter landscapes · Outdoor adventure" },
  { key: "hospitality", label: "HOSPITALITY\n& EVENTS", sub: "Venues · Brand showcases · Weddings & celebrations" },
] as const;

export const PHOTO_CATEGORIES = [
  { key: "music", label: "MUSIC", sub: "Concert films · Live performances · Artist portraits" },
  { key: "snow", label: "SNOW", sub: "Alpine · Winter landscapes · Nature" },
  { key: "sports", label: "SPORTS", sub: "Athletic campaigns · Event coverage · Action" },
  { key: "event", label: "EVENTS", sub: "Venues · Brand showcases · Celebrations" },
] as const;

export async function fetchMedia(kind: MediaKind, featured = false): Promise<MediaItem[]> {
  const res = await fetch(`${BASE}/api/media?kind=${kind}${featured ? "&featured=1" : ""}`);
  if (!res.ok) throw new Error(`Failed to load ${kind}s`);
  return res.json();
}

export function useMedia(kind: MediaKind, opts: { featured?: boolean } = {}) {
  return useQuery({
    queryKey: ["media", kind, Boolean(opts.featured)],
    queryFn: () => fetchMedia(kind, opts.featured),
    staleTime: 60_000,
  });
}

// ── Link parsing (used by the portal) ────────────────────────────────────────

export type ParsedVideo = { id: string; embedSrc: string; aspect: Aspect } | null;

/**
 * Accepts anything Luca might paste — a full YouTube <iframe> embed code, a
 * youtube.com/watch link, a youtu.be share link, a /shorts/ link, or an
 * /embed/ URL — and returns a clean embed URL plus a best-guess aspect ratio.
 */
export function parseYouTube(input: string): ParsedVideo {
  const text = input.trim();
  if (!text) return null;

  let url = text;
  let iframeW: number | null = null;
  let iframeH: number | null = null;
  if (/<iframe/i.test(text)) {
    url = text.match(/src=["']([^"']+)["']/i)?.[1] ?? "";
    iframeW = Number(text.match(/width=["']?(\d+)/i)?.[1]) || null;
    iframeH = Number(text.match(/height=["']?(\d+)/i)?.[1]) || null;
  }

  const id =
    url.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/)([A-Za-z0-9_-]{11})/)?.[1] ??
    url.match(/youtube\.com\/watch\?(?:.*&)?v=([A-Za-z0-9_-]{11})/)?.[1] ??
    url.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)?.[1] ??
    null;
  if (!id) return null;

  const vertical = /\/shorts\//.test(url) || (iframeW !== null && iframeH !== null && iframeH > iframeW);
  return {
    id,
    embedSrc: `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&playsinline=1&controls=0`,
    aspect: vertical ? "9/16" : "16/9",
  };
}

export function youTubeId(src: string): string {
  return src.match(/\/embed\/([A-Za-z0-9_-]{11})/)?.[1] ?? "";
}

/** Pulls image URLs out of whatever was pasted: plain links (one per line) or <img> tags. */
export function parseImageUrls(input: string): string[] {
  const urls = new Set<string>();
  for (const m of input.matchAll(/https:\/\/[^\s"'<>]+/g)) {
    urls.add(m[0].replace(/[),.;]+$/, ""));
  }
  return [...urls];
}

/** Ask Cloudinary for a resized, auto-format version instead of the full original. */
export function optimizeImage(src: string, width = 1800): string {
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) return src;
  if (/\/image\/upload\/[^/]*(?:w_|q_auto|f_auto)/.test(src)) return src;
  return src.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width}/`);
}
