import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGetRecentWork } from "@workspace/api-client-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getYoutubeThumbnail(url: string): string {
  // Extract video ID from various YouTube embed URL formats
  const match = url.match(/embed\/([^?&]+)/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return "";
}

type RecentWorkItem = {
  id: number;
  type: string;
  embedUrl: string;
  title: string;
  category: string;
  dateAdded: string;
  active: boolean;
};

function WorkCard({ item }: { item: RecentWorkItem }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnail = item.type === "video" ? getYoutubeThumbnail(item.embedUrl) : item.embedUrl;

  return (
    <div className="flex-shrink-0 w-[280px] md:w-[380px] lg:w-[420px] group">
      <div className="relative aspect-video bg-white/5 border border-white/10 overflow-hidden">
        {item.type === "video" ? (
          isPlaying ? (
            <iframe
              src={`${item.embedUrl}${item.embedUrl.includes("?") ? "&" : "?"}autoplay=1&mute=0&controls=1&cc_load_policy=0&iv_load_policy=3`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 w-full h-full cursor-pointer"
              aria-label={`Play ${item.title}`}
            >
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border border-white/60 flex items-center justify-center backdrop-blur-sm bg-black/30 group-hover:border-white group-hover:bg-black/50 transition-all duration-300">
                  <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )
        ) : (
          <img
            src={item.embedUrl}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}

        {/* Type badge */}
        <div className="absolute top-3 left-3 font-mono text-[9px] tracking-widest text-white/60 uppercase bg-black/60 px-2 py-1 border border-white/10">
          {item.type === "video" ? "VIDEO" : "PHOTO"}
        </div>
      </div>

      {/* Labels */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <p className="font-sans font-bold text-white text-sm tracking-wide uppercase leading-tight">
          {item.title}
        </p>
        <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase whitespace-nowrap mt-0.5">
          {item.category}
        </span>
      </div>
    </div>
  );
}

export default function RecentWorkCarousel() {
  const { data: items } = useGetRecentWork();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full bg-black py-20 border-t border-white/10" id="recent-work">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        {/* Header row */}
        <div className="flex items-end justify-between gap-4 mb-10 uppercase">
          <div className="flex items-end gap-2">
            <span className="font-mono text-xl md:text-2xl text-white/50">00</span>
            <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-widest text-white leading-none">
              RECENT WORK
            </h2>
          </div>

          {/* Arrow controls — hidden on mobile, shown md+ */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/60 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/60 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel track */}
        <motion.div
          ref={scrollRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:snap-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {items.map((item) => (
            <div key={item.id} className="snap-start">
              <WorkCard item={item} />
            </div>
          ))}
        </motion.div>

        {/* Mobile swipe hint */}
        <p className="mt-4 font-mono text-[9px] tracking-widest text-white/20 uppercase md:hidden">
          SWIPE TO BROWSE
        </p>
      </div>
    </section>
  );
}
