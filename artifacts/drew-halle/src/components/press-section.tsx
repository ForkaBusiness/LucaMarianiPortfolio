import { motion } from "framer-motion";

const AWARDS = [
  { id: "01", name: "CHICAGO STUDENT EMMY", detail: "CINEMATOGRAPHY" },
  { id: "02", name: "CHICAGO STUDENT EMMY", detail: "NOMINEE" },
  { id: "03", name: "CHICAGO STUDENT EMMY", detail: "NOMINEE" }
];

const CLIENT_GROUPS = [
  {
    label: "MUSIC",
    clients: ["LORD HURON", "INDIGO DE SOUZA", "THE RED CLAY STRAYS", "THE SALT SHED (CHICAGO)", "TWO DOOR CINEMA CLUB"]
  },
  {
    label: "SPORTS",
    clients: ["ALPINE VALLEY RESORT", "VAIL RESORTS", "NSE ATHLETICS", "MAX HOLLOWAY"]
  },
  {
    label: "MEDIA",
    clients: ["BACKYARD BREAKS", "MAD ENTERPRISES"]
  },
  {
    label: "HOSPITALITY",
    clients: ["OOVIO"]
  }
];

export default function PressSection() {
  return (
    <section className="w-full bg-black py-24 border-t border-white/10" id="press">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center mb-16 uppercase text-center">
          <p className="font-mono text-[10px] tracking-widest text-white/50 mb-4">CREDITS · WORKED WITH</p>
          <div className="flex items-start gap-4">
            <span className="font-mono text-xl md:text-2xl text-white/50">05</span>
            <h2 className="font-sans text-4xl md:text-6xl font-bold tracking-widest text-white leading-none">
              PRESS & CLIENTS
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 mb-16 border-t border-b border-white/10 py-16">
          {/* Awards Column */}
          <div className="flex flex-col">
            <h3 className="font-mono text-xs tracking-widest text-white/50 mb-8 uppercase">AWARDS & RECOGNITION</h3>
            <div className="flex flex-col gap-6">
              {AWARDS.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-center justify-between border-b border-white/10 pb-6 uppercase"
                >
                  <div className="flex items-center gap-6">
                    <span className="font-mono text-[10px] text-white/30">{item.id}</span>
                    <div className="flex flex-col">
                      <span className="font-sans text-2xl md:text-3xl font-bold tracking-widest text-white">
                        {item.name}
                      </span>
                      <span className="font-mono text-[10px] tracking-widest text-white/50 mt-1">{item.detail}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Clients Column */}
          <div className="flex flex-col gap-12">
            <h3 className="font-mono text-xs tracking-widest text-white/50 uppercase">CLIENTS & COLLABORATORS</h3>
            {CLIENT_GROUPS.map((group, gIdx) => (
              <motion.div
                key={gIdx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: gIdx * 0.1 }}
              >
                <p className="font-mono text-[10px] tracking-widest text-white/40 uppercase mb-3 border-b border-white/10 pb-2">{group.label}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-2 uppercase leading-loose">
                  {group.clients.map((client, idx) => (
                    <span key={idx} className="font-sans text-xl md:text-2xl font-medium tracking-widest text-white/80 hover:text-white transition-colors">
                      {client}
                      {idx < group.clients.length - 1 && <span className="mx-3 text-white/20">·</span>}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 font-mono text-[10px] tracking-widest text-white/50 uppercase text-center md:text-left">
          <p className="max-w-2xl leading-relaxed">
            CONCERTS · SPORTS · BRAND WORK · WEDDINGS · PHOTOGRAPHY · CUSTOM PROJECTS
          </p>
          <div className="flex items-center gap-8">
            <span>[ 05 / 05 ]</span>
          </div>
        </div>
      </div>
    </section>
  );
}
