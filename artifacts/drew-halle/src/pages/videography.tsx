import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

type Video = {
  id: string;
  title: string;
  src: string;
  aspect: "16/9" | "9/16";
  allow?: string;
  referrerPolicy?: string;
};

type Category = {
  key: string;
  label: string;
  sub: string;
  videos: Video[];
};

const ALLOW_STD = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
const REF_STD = "strict-origin-when-cross-origin";

const CATEGORIES: Category[] = [
  {
    key: "music",
    label: "MUSIC",
    sub: "Concert films · Live performances · Artist narratives",
    videos: [
      {
        id: "m2",
        title: "Two Door Cinema Club",
        src: "https://www.youtube-nocookie.com/embed/omdgY4VaRPE?si=CTGxh2KKS_bEn8uM&controls=0",
        aspect: "16/9",
        allow: ALLOW_STD,
        referrerPolicy: REF_STD,
      },
      {
        id: "m1",
        title: "Red Clay Strays",
        src: "https://www.youtube.com/embed/r_59JjsZaz4?controls=0&modestbranding=1&rel=0&playsinline=1",
        aspect: "9/16",
        allow: ALLOW_STD,
      },
    ],
  },
  {
    key: "sports",
    label: "SPORTS",
    sub: "Athletic campaigns · Event coverage · Brand films",
    videos: [
      {
        id: "s4",
        title: "Home of the Titans",
        src: "https://www.youtube-nocookie.com/embed/1WD9J_-PJlQ?si=yD2xY_4aMNWlgbiV&controls=0",
        aspect: "16/9",
        allow: ALLOW_STD,
        referrerPolicy: REF_STD,
      },
      {
        id: "s1",
        title: "Roll South",
        src: "https://www.youtube-nocookie.com/embed/XG2WVE4Y0cg?si=u48GD5YMB6n6GxiH&controls=0",
        aspect: "16/9",
        allow: ALLOW_STD,
        referrerPolicy: REF_STD,
      },
      {
        id: "s2",
        title: "Glenbrook South Football",
        src: "https://www.youtube-nocookie.com/embed/u4KPLhTTo3g?si=V7RTadZUw6uKyaJp&controls=0",
        aspect: "16/9",
        allow: ALLOW_STD,
        referrerPolicy: REF_STD,
      },
      {
        id: "s3",
        title: "Glenbrook South Hockey",
        src: "https://www.youtube-nocookie.com/embed/vSOkSNK1-E4?si=QA3ee9odZ2WRs7Jj&controls=0",
        aspect: "16/9",
        allow: ALLOW_STD,
        referrerPolicy: REF_STD,
      },
    ],
  },
  {
    key: "snow",
    label: "SNOW",
    sub: "Alpine · Winter landscapes · Outdoor adventure",
    videos: [
      {
        id: "sn1",
        title: "Crystal Ridge Park Follow Cam",
        src: "https://www.youtube.com/embed/VwkKoKVDU3g?modestbranding=1&rel=0&playsinline=1&controls=0",
        aspect: "9/16",
        allow: ALLOW_STD,
      },
      {
        id: "sn2",
        title: "Alpine Valley Park Follow Cam #1",
        src: "https://www.youtube.com/embed/o5AmOaYRXjw?modestbranding=1&rel=0&playsinline=1&controls=0",
        aspect: "9/16",
        allow: ALLOW_STD,
      },
      {
        id: "sn3",
        title: "Alpine Valley Park Follow Cam #3",
        src: "https://www.youtube.com/embed/p-lvvaiAmOQ?modestbranding=1&rel=0&playsinline=1&controls=0",
        aspect: "9/16",
        allow: ALLOW_STD,
      },
      {
        id: "sn4",
        title: "Alpine Valley Park Follow Cam #2",
        src: "https://www.youtube.com/embed/_H6hO0xat2s?modestbranding=1&rel=0&playsinline=1&controls=0",
        aspect: "9/16",
        allow: ALLOW_STD,
      },
    ],
  },
  {
    key: "hospitality",
    label: "HOSPITALITY\n& EVENTS",
    sub: "Venues · Brand showcases · Weddings & celebrations",
    videos: [
      {
        id: "h1",
        title: "Ovvio",
        src: "https://www.youtube-nocookie.com/embed/vXhoXWMxVr0?si=hyk8Th8K5eyMKj-_&controls=0",
        aspect: "16/9",
        allow: ALLOW_STD,
        referrerPolicy: REF_STD,
      },
      {
        id: "h2",
        title: "Ovvio",
        src: "https://www.youtube-nocookie.com/embed/STKgmNhSFP0?si=CTtxMoX7NUXfw3bd&controls=0",
        aspect: "16/9",
        allow: ALLOW_STD,
        referrerPolicy: REF_STD,
      },
      {
        id: "h3",
        title: "Alpine Valley Resorts Wedding",
        src: "https://www.youtube-nocookie.com/embed/ROQukR7EJgA?si=yfDztzVF7diBHTo4&controls=0",
        aspect: "16/9",
        allow: ALLOW_STD,
        referrerPolicy: REF_STD,
      },
      {
        id: "h4",
        title: "Lake Forest Chiro",
        src: "https://www.youtube.com/embed/xlhhCYGaEqo?si=3GockmbNT9IHYxb0&controls=0&modestbranding=1&rel=0&playsinline=1",
        aspect: "9/16",
        allow: ALLOW_STD,
      },
      {
        id: "h6",
        title: "Backyard Breaks Interview",
        src: "https://www.youtube.com/embed/J_fgrEz_QOg?modestbranding=1&rel=0&playsinline=1&controls=0",
        aspect: "9/16",
        allow: ALLOW_STD,
      },
    ],
  },
];

// ── Cinema Player ──────────────────────────────────────────────────────────────

function CinemaPlayer({ video, onClose }: { video: Video; onClose: () => void }) {
  const [muted, setMuted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isPortrait = video.aspect === "9/16";

  const activeSrc = (() => {
    let s = video.src;
    if (!s.includes("enablejsapi")) s += "&enablejsapi=1";
    if (!s.includes("autoplay")) s += "&autoplay=1";
    // Hide YouTube captions/annotations so videos play clean
    if (!s.includes("cc_load_policy")) s += "&cc_load_policy=0&iv_load_policy=3";
    return s;
  })();

  const toggleMute = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    const next = !muted;
    iframe.contentWindow.postMessage(
      JSON.stringify({ event: "command", func: next ? "mute" : "unMute", args: "" }),
      "*"
    );
    setMuted(next);
  }, [muted]);

  // Escape key closes player
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      key="cinema"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* Expanding video container */}
      <motion.div
        initial={{ scale: 0.55, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`relative flex flex-col ${
          isPortrait
            ? "h-[88dvh] w-auto aspect-[9/16]"
            : "w-[92vw] max-w-6xl aspect-video"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HUD top bar */}
        <div className="absolute -top-8 inset-x-0 flex items-center justify-between z-10 px-1">
          <button
            onClick={onClose}
            className="font-mono text-[10px] tracking-widest uppercase text-white/60 hover:text-white transition-colors flex items-center gap-2"
          >
            ← BACK
          </button>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/40 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
            REC
          </div>
        </div>

        {/* Video frame */}
        <div className="relative w-full h-full border border-white/10 overflow-hidden bg-black">
          <iframe
            ref={iframeRef}
            className="absolute inset-0 w-full h-full"
            src={activeSrc}
            title={video.title}
            frameBorder="0"
            allow={video.allow}
            referrerPolicy={video.referrerPolicy as React.IframeHTMLAttributes<HTMLIFrameElement>["referrerPolicy"]}
            allowFullScreen
          />
        </div>

        {/* HUD bottom bar */}
        <div className="absolute -bottom-8 inset-x-0 flex items-center justify-between z-10 px-1">
          <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase truncate max-w-[60%]">
            {video.title}
          </p>
          <button
            onClick={toggleMute}
            className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest uppercase text-white/40 hover:text-white transition-colors"
          >
            {muted ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM17.78 9.22a.75.75 0 1 0-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 1 0 1.06-1.06L20.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-1.72 1.72-1.72-1.72Z" />
                </svg>
                UNMUTE
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                  <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06ZM15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
                </svg>
                MUTE
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Video Card (thumbnail only — cinema player handles playback) ───────────────

function VideoCard({ video, onPlay }: { video: Video; onPlay: (v: Video) => void }) {
  const isPortrait = video.aspect === "9/16";
  const videoId = video.src.match(/\/embed\/([^?]+)/)?.[1] ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-0 w-full"
    >
      <div
        className={`relative w-full bg-black overflow-hidden cursor-pointer group ${
          isPortrait ? "aspect-[9/16]" : "aspect-video"
        }`}
        onClick={() => onPlay(video)}
      >
        <img
          src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
          alt={video.title}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center group-hover:border-white group-hover:scale-110 transition-all duration-300">
            <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Title bar */}
      <div className="border border-t-0 border-white/10 px-3 py-2 bg-black">
        <p className="font-mono text-[9px] tracking-widest text-white/30 uppercase truncate">{video.title}</p>
      </div>
    </motion.div>
  );
}

// ── Placeholder ───────────────────────────────────────────────────────────────

function PlaceholderCard() {
  return (
    <div className="relative aspect-video bg-white/[0.03] border border-white/10 flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center">
        <svg className="w-4 h-4 text-white/20 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
      <p className="font-mono text-[9px] tracking-widest text-white/20 uppercase">VIDEO COMING SOON</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Videography() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const filtered = activeCategory
    ? CATEGORIES.filter((c) => c.key === activeCategory)
    : CATEGORIES;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <Nav />

      {/* Page header */}
      <header className="pt-32 pb-16 px-4 md:px-8 border-b border-white/10 max-w-[1600px] mx-auto">
        <div className="flex items-start justify-between">
          <div>
            <Link href="/">
              <span className="font-mono text-[10px] tracking-widest text-white/40 uppercase hover:text-white transition-colors cursor-pointer flex items-center gap-2 mb-8">
                ← BACK TO HOME
              </span>
            </Link>
            <h1
              className="font-sans font-black uppercase tracking-tighter leading-none text-white whitespace-nowrap"
              style={{ fontSize: "clamp(3rem, 14vw, 240px)" }}
            >
              VIDEOGRAPHY
            </h1>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1 font-mono text-[10px] tracking-widest text-white/30 uppercase mt-auto pb-2">
            <p>LUCA MARIANI · LUCA FILMS</p>
            <p>CHICAGO · WORLDWIDE</p>
            <p className="flex items-center gap-2 text-white/60 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              REC · 24.976 FPS
            </p>
          </div>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap gap-3 mt-12">
          <button
            onClick={() => setActiveCategory(null)}
            className={`font-mono text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors ${
              activeCategory === null
                ? "border-white text-white bg-white/10"
                : "border-white/20 text-white/40 hover:border-white/50 hover:text-white/70"
            }`}
          >
            ALL
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`font-mono text-[10px] tracking-widest uppercase px-4 py-2 border transition-colors ${
                activeCategory === cat.key
                  ? "border-white text-white bg-white/10"
                  : "border-white/20 text-white/40 hover:border-white/50 hover:text-white/70"
              }`}
            >
              {cat.label.replace("\n", " ")}
            </button>
          ))}
        </div>
      </header>

      {/* Category sections */}
      <main className="max-w-[1600px] mx-auto px-4 md:px-8 py-16 space-y-24">
        {filtered.map((cat, catIdx) => (
          <motion.section
            key={cat.key}
            id={cat.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: catIdx * 0.05 }}
          >
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/10">
              <div>
                <p className="font-mono text-[10px] tracking-widest text-white/30 uppercase mb-2">
                  {String(catIdx + 1).padStart(2, "0")}
                </p>
                <h2
                  className="font-sans font-black uppercase leading-[0.85] text-white whitespace-pre-line"
                  style={{ fontSize: "clamp(40px, 6vw, 80px)" }}
                >
                  {cat.label}
                </h2>
                <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase mt-3">{cat.sub}</p>
              </div>
              <span className="font-mono text-[10px] text-white/20 tracking-widest uppercase hidden md:block">
                {cat.videos.length} FILM{cat.videos.length !== 1 ? "S" : ""}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.videos.map((v) => (
                <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
              ))}
              {cat.videos.length === 0 &&
                [0, 1, 2].map((i) => <PlaceholderCard key={i} />)}
            </div>
          </motion.section>
        ))}
      </main>

      <Footer />

      {/* Cinema player overlay */}
      <AnimatePresence>
        {activeVideo && (
          <CinemaPlayer video={activeVideo} onClose={() => setActiveVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
