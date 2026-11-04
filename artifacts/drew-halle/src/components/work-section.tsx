import { motion } from "framer-motion";
import { Link } from "wouter";

const CARDS = [
  {
    id: "N001",
    line1: "PHOTO",
    line2: "GRAPHY",
    category: "Concert & Sports Photography",
    meta: "STILLS · 2019—2026",
    image: "/work-photography.jpg",
    link: "#photography"
  },
  {
    id: "N002",
    line1: "VIDEO",
    line2: "GRAPHY",
    category: "Sports & Concert Film",
    meta: "FILMS · LIVE",
    image: "/work-videography.jpg",
    link: "/videography"
  }
];

export default function WorkSection() {
  return (
    <section className="w-full min-h-screen bg-black py-24 border-t border-white/10" id="work">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-end justify-between mb-16 uppercase">
          <div className="flex items-start gap-4">
            <span className="font-mono text-2xl md:text-4xl text-white/50">02</span>
            <h2 className="font-sans text-5xl md:text-7xl font-bold tracking-widest text-white leading-none">
              SELECT WORK
            </h2>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1 font-mono text-[10px] tracking-widest text-muted-foreground">
            <p>REEL — LUCA MARIANI · LUCAFILMS</p>
            <p className="flex items-center gap-2 text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              REC · N001
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {CARDS.map((card, idx) => {
            const inner = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group relative flex flex-col gap-4 w-full cursor-pointer"
                data-testid={`card-work-${card.id}`}
              >
                {/* Image with overlaid label */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/5">
                  <div className="absolute top-4 left-4 z-20 font-mono text-[10px] tracking-widest text-white/70 uppercase">
                    {card.id}
                  </div>
                  <img
                    loading="lazy"
                    decoding="async"
                    src={card.image}
                    alt={card.category}
                    className="w-full h-full object-cover opacity-100 md:grayscale md:opacity-80 md:group-hover:grayscale-0 md:group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 z-10 px-4 pb-4 uppercase">
                    <p
                      className="font-sans font-black text-white/80 group-hover:text-white transition-colors duration-500"
                      style={{ fontSize: "clamp(52px, 8vw, 92px)", lineHeight: 0.85 }}
                    >
                      {card.line1}<br />{card.line2}
                    </p>
                  </div>
                </div>
                {/* Footer row */}
                <div className="flex items-center justify-between border-t border-white/10 pt-4 uppercase">
                  <p className="font-mono text-[10px] tracking-widest text-white/50">{card.category}</p>
                  <div className="flex items-center gap-4 font-mono text-[10px] tracking-widest text-white/40">
                    <span>{card.meta}</span>
                    <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </motion.div>
            );

            return card.link.startsWith("/") ? (
              <Link key={card.id} href={card.link}>{inner}</Link>
            ) : (
              <a key={card.id} href={card.link}>{inner}</a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
