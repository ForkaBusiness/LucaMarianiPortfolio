import { motion } from "framer-motion";
import { Link } from "wouter";

const IMAGES = [
  { src: "https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165049/AnnaMariaIsland-154_orakkw.jpg", alt: "Lord Huron at The Salt Shed" },
  { src: "https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164977/Night1RCS-09_wuu7ay.jpg", alt: "Red Clay Strays live concert" },
  { src: "https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165080/DSC00952_nugqp9.jpg", alt: "Event photography Chicago" },
  { src: "https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165047/AnnaMariaIsland-165_jfisyj.jpg", alt: "Lord Huron stage performance" },
  { src: "https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164975/Night2RCS-59_usmzzf.jpg", alt: "Red Clay Strays concert photography" },
  { src: "https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165040/AnnaMariaIsland-149_x04adk.jpg", alt: "Lord Huron Salt Shed Chicago" },
  { src: "https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779164965/Night1RCS-33_df5kvd.jpg", alt: "Red Clay Strays night one" },
  { src: "https://res.cloudinary.com/dgqwzy1a0/image/upload/f_auto,q_auto,w_1800/v1779165079/DSC01061_irfldl.jpg", alt: "Live event coverage" },
];

export default function GallerySection() {
  return (
    <section className="w-full bg-black py-24 border-t border-white/10" id="photography">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 uppercase">
          <h2 className="font-sans text-4xl md:text-5xl font-bold tracking-widest text-white leading-none">
            GALLERY
          </h2>
          <Link href="/photography">
            <span className="font-mono text-[10px] tracking-widest text-white hover:text-red-500 transition-colors cursor-pointer">
              VIEW ALL PHOTOS →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {IMAGES.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}
              className="relative aspect-[4/5] bg-white/5 overflow-hidden group cursor-pointer"
            >
              <img
                loading="lazy"
                decoding="async"
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover opacity-100 md:grayscale md:opacity-80 md:group-hover:grayscale-0 md:group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
              <div className="absolute bottom-4 left-4 font-mono text-[10px] tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                FRAME {String(idx + 1).padStart(3, "0")}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
