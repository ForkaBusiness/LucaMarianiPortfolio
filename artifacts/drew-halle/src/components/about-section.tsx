import { motion } from "framer-motion";

export default function AboutSection() {
  return (
    <section className="w-full min-h-[100dvh] bg-black py-24 border-t border-white/10 flex flex-col" id="about">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 w-full flex-1 flex flex-col">
        <div className="flex items-end gap-4 mb-16 uppercase">
          <span className="font-mono text-2xl md:text-4xl text-white/50">03</span>
          <h2 className="font-sans text-5xl md:text-7xl font-bold tracking-widest text-white leading-none">
            ABOUT
          </h2>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="font-mono text-[10px] tracking-widest text-white/50 uppercase mb-8">
            LUCA MARIANI — FILMMAKER · VIDEOGRAPHER · PHOTOGRAPHER
          </p>

          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-sans text-3xl md:text-5xl lg:text-6xl font-semibold leading-[0.9] tracking-widest text-white uppercase mb-12"
          >
            CONCERTS. SPORTS. BRANDS. SHOT OUT OF CHICAGO, ANYWHERE YOU NEED ME.
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 items-start"
          >
            {/* Col 1 — Bio */}
            <div className="flex flex-col gap-6">
              <p className="font-sans text-base md:text-lg tracking-widest leading-relaxed text-muted-foreground uppercase">
                I GREW UP WITH SKIS ON MY FEET AND A CAMERA IN MY HAND, TRYING TO FILM WHAT THE DAY ACTUALLY FELT LIKE: COLD AIR, BAD LIGHT, THE MOMENT SOMEBODY FINALLY STOMPED THE LANDING. THAT'S WHERE I LEARNED TO SHOOT.
              </p>
              <p className="font-sans text-base md:text-lg tracking-widest leading-relaxed text-muted-foreground uppercase">
                YOU LEARN FAST ON A MOUNTAIN. YOU CAN'T ASK THE MOMENT TO HAPPEN AGAIN. YOU CAN'T RESET THE LIGHT. YOU READ IT OR YOU LOSE IT. EVERYTHING I SHOOT NOW COMES OUT OF THAT.
              </p>
              <p className="font-sans text-base md:text-lg tracking-widest leading-relaxed text-muted-foreground uppercase">
                CONCERTS. SPORTS. SKIING. WEDDINGS. BRAND WORK FOR THE ROOMS THAT CARE HOW THEY LOOK. PHOTO AND VIDEO, WHICHEVER THE DAY CALLS FOR.
              </p>
              <p className="font-sans text-base md:text-lg tracking-widest leading-relaxed text-white uppercase font-semibold">
                CLEAN EDITS, REAL MOMENTS, NO FILLERS.
              </p>
            </div>

            {/* Col 2 — Awards / Services / Based In */}
            <div className="flex flex-col gap-8 font-mono text-xs tracking-widest uppercase">
              <div>
                <p className="text-white/40 mb-2 border-b border-white/10 pb-2">AWARDS</p>
                <p className="text-white leading-loose">
                  CHICAGO STUDENT EMMY<br />
                  CINEMATOGRAPHY<br />
                  <span className="text-white/60">TWO-TIME NOMINEE</span>
                </p>
              </div>
              <div>
                <p className="text-white/40 mb-2 border-b border-white/10 pb-2">SERVICES</p>
                <p className="text-white leading-loose">
                  CONCERT & LIVE MUSIC<br />
                  SPORTS HYPE FILMS<br />
                  BRAND & COMMERCIAL<br />
                  WEDDINGS<br />
                  PHOTOGRAPHY<br />
                  CUSTOM PROJECTS
                </p>
              </div>
              <div>
                <p className="text-white/40 mb-2 border-b border-white/10 pb-2">BASED IN</p>
                <p className="text-white leading-loose">
                  CHICAGO, IL<br />
                  <span className="text-white/60">WILL TRAVEL</span>
                </p>
              </div>
            </div>

            {/* Col 3 — Emmy photo */}
            <div className="flex flex-col gap-0">
              {/* Cinematic frame header */}
              <div className="border border-white/20 border-b-0 px-3 py-1.5 flex items-center justify-between">
                <span className="font-mono text-[8px] tracking-widest text-white/40 uppercase">
                  CHICAGO / MIDWEST EMMY AWARDS
                </span>
                <span className="font-mono text-[8px] tracking-widest text-white/20 uppercase">
                  2025
                </span>
              </div>

              {/* Photo */}
              <div className="border border-white/20 overflow-hidden">
                <img
                  loading="lazy"
                  decoding="async"
                  src="/emmy.jpg"
                  alt="Luca Mariani at the Chicago/Midwest Emmy Awards"
                  className="w-full object-cover md:grayscale md:hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* Frame footer + button */}
              <div className="border border-white/20 border-t-0 px-3 py-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[8px] tracking-widest text-white/30 uppercase leading-tight">
                  STUDENT EMMY<br />CINEMATOGRAPHY
                </span>
                <a
                  href="https://www.linkedin.com/posts/luca-mariani-4858852ba_a-few-weeks-ago-i-won-my-first-student-emmy-share-7461471729668759553-cbd_?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEyo7GUBUIzIo-3roDosTEU5W5mMt0d5HgY"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 border border-white/30 text-white/60 hover:border-white hover:text-white transition-colors whitespace-nowrap"
                >
                  LEARN MORE
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-8 mt-16 font-mono text-[10px] tracking-widest uppercase text-white/50">
          <p>[ 03 / 05 ]</p>
          <p className="flex items-center gap-2 text-white">↓ FILM</p>
        </div>
      </div>
    </section>
  );
}
