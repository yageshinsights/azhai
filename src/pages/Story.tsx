import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const chapters = [
  {
    tamil: "'அழைப்பு' · 'அழகு'",
    title: "The Name from the Heart",
    body: "In Tamil, Azhai (அழைப்பு) means 'invitation'—a warm, personal call. And Azhagu (அழகு) means 'inherent beauty.' Preethi chose these words to remind every wearer: you are not borrowing someone else's grace. You are returning to your own."
  },
  {
    tamil: "The Unbroken Thread",
    title: "The Ornate Initial 'A'",
    body: "The sweeping, looping 'A' is not decoration. It is the single, unbroken thread of handloom tradition—visualized. From the ancient weaver's hands, through Preethi's sketchbook, into your wardrobe: the thread never breaks."
  },
  {
    tamil: "🪷 Lotus Above the 'i'",
    title: "The Blooming Crown",
    body: "The stylized maroon lotus above the 'i' is a timeless symbol of purity, rebirth, and divine beauty. Each Azhai garment, like the lotus, rises from the earth of tradition and blooms with untainted elegance."
  },
  {
    tamil: "Sacred Maroon · Temple Gold",
    title: "The Colors of Ritual",
    body: "Maroon was chosen as the color of sacred threads, temple rituals, and heirloom fabrics. Gold—the color of brass lamps, zari borders, and Preethi's brass needle—adds the shimmer of living tradition."
  }
];

export default function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 text-[#110B0E]">
      
      {/* Hero */}
      <section className="relative py-20 px-5 sm:px-8 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto space-y-4"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[#7B1C2E] font-bold bg-[#7B1C2E]/8 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3 text-[#C9A96E]" />
            <span>The Brand Origin</span>
          </span>
          <img src="/logo-light.png" alt="Azhai" className="h-20 sm:h-24 mx-auto object-contain pt-2" />
          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#1C1318]">The Story of Azhai</h1>
          <p className="font-script text-3xl text-[#7B1C2E]">An invitation crafted by Preethi</p>
        </motion.div>
      </section>

      {/* Chapters Timeline */}
      <div ref={ref} className="max-w-3xl mx-auto px-5 sm:px-8 pb-28 relative">
        <div className="absolute left-5 sm:left-8 top-0 bottom-0 w-0.5 bg-[#E8D7B5]/40">
          <motion.div className="w-full bg-[#7B1C2E]" style={{ height: lineHeight }} />
        </div>

        <div className="space-y-16 pl-10 sm:pl-14">
          {chapters.map((ch, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="relative bg-white p-6 sm:p-8 rounded-3xl border border-[#E8D7B5]/60 shadow-sm space-y-3"
            >
              <div className="absolute -left-[2.9rem] sm:-left-[3.9rem] top-8 w-4 h-4 rounded-full bg-[#7B1C2E] border-4 border-[#FAF7F2] shadow-sm" />
              
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#7B1C2E] font-bold">{ch.tamil}</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#1C1318]">{ch.title}</h2>
              <p className="text-sm text-[#7A6D74] leading-relaxed font-light">{ch.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 px-5 sm:px-8 text-center bg-[#F4EFEA] border-t border-[#E8D7B5]/40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-5 max-w-xl mx-auto"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1C1318]">Accept the invitation.</h2>
          <p className="text-sm text-[#7A6D74]">Explore our latest drop of handcrafted heirloom silks.</p>
          <div className="pt-2">
            <Link to="/collections" className="inline-flex items-center gap-3 px-8 py-4 bg-[#7B1C2E] hover:bg-[#9B2D42] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-full shadow-md transition-all">
              <span>Explore Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
