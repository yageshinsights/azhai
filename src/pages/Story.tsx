import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import SEOHead from '@/components/SEOHead';

const chapters = [
  {
    tagline: "The Meaning of the Name",
    title: "An Invitation to Inherent Elegance",
    body: "Azhai carries a poetic double meaning: a warm personal 'invitation', and 'inherent grace.' Preethi chose this name to remind every wearer: you are not borrowing someone else's beauty. You are simply returning to your own."
  },
  {
    tagline: "The Unbroken Thread",
    title: "The Sweeping Loop of the Initial 'A'",
    body: "The continuous looping 'A' is the single, unbroken thread of handloom tradition visualized. From the master artisan's hands, through Preethi's sketchbook, into your wardrobe: the craft thread never breaks."
  },
  {
    tagline: "The Blooming Crown",
    title: "The Lotus Rising Above the 'i'",
    body: "The stylized lotus above the letter 'i' is a timeless symbol of purity, rebirth, and grace. Each Azhai creation rises from the soil of artisanal textile heritage and blooms with contemporary poise."
  },
  {
    tagline: "The Colors of Ritual",
    title: "Sacred Maroon & Temple Gold",
    body: "Crimson Maroon was chosen as the color of sacred wedding threads and auspicious silks. Temple Gold—the color of brass oil lamps and handloom zari borders—adds the living shimmer of celebration."
  }
];

export default function Story() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const storySchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'The Story of Azhai — Handloom Heritage & Philosophy',
    description: 'An invitation to inherent elegance crafted by Preethi. Discover Azhai’s journey from handloom textile traditions in Sri Lanka to modern festive couture.',
    url: 'https://azhaiclothing.lk/story',
    publisher: {
      '@type': 'ClothingStore',
      name: 'Azhai Clothing by Preethi',
      logo: 'https://azhaiclothing.lk/logo-light.png',
    },
  }), []);

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 text-[#110B0E]">
      <SEOHead
        title="Our Story & Weaving Heritage — An Invitation by Preethi"
        description="Discover the meaning behind Azhai: the unbroken thread of handloom silk tradition, the blooming lotus crown, and sacred ritual drapes."
        canonicalUrl="https://azhaiclothing.lk/story"
        url="https://azhaiclothing.lk/story"
        schema={storySchema}
      />
      
      {/* ── HERO SECTION WITH ANIMATED LOGO ── */}
      <section className="relative py-20 px-5 sm:px-8 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-3xl mx-auto space-y-5"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold bg-[#701626]/8 px-3.5 py-1 rounded-full border border-[#C5A059]/30 shadow-sm">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>The Brand Origin & Philosophy</span>
          </span>

          {/* ✨ HERO ANIMATED LOGO ✨ */}
          <div className="py-2">
            <AnimatedLogo size="xl" withAura={true} replayable={true} />
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold text-[#110B0E]">
            The Story of Azhai
          </h1>
          <p className="font-script text-3xl sm:text-4xl text-[#701626]">
            An invitation crafted by Preethi
          </p>
        </motion.div>
      </section>

      {/* Chapters Timeline */}
      <div ref={ref} className="max-w-3xl mx-auto px-5 sm:px-8 pb-28 relative">
        <div className="absolute left-5 sm:left-8 top-0 bottom-0 w-0.5 bg-[#C5A059]/30">
          <motion.div className="w-full bg-[#701626]" style={{ height: lineHeight }} />
        </div>

        <div className="space-y-16 pl-10 sm:pl-14">
          {chapters.map((ch, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6 }}
              className="relative bg-white p-6 sm:p-8 rounded-3xl border border-[#C5A059]/40 shadow-sm space-y-3"
            >
              <div className="absolute -left-[2.9rem] sm:-left-[3.9rem] top-8 w-4 h-4 rounded-full bg-[#701626] border-4 border-[#FCFBF8] shadow-sm" />
              
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">{ch.tagline}</p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#110B0E]">{ch.title}</h2>
              <p className="text-sm text-[#6D6268] leading-relaxed font-light">{ch.body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-20 px-5 sm:px-8 text-center bg-[#F7F4EE] border-t border-[#C5A059]/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-5 max-w-xl mx-auto"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">Accept the invitation.</h2>
          <p className="text-sm text-[#6D6268] font-light">Explore our latest drop of handcrafted heirloom silks.</p>
          <div className="pt-2">
            <Link to="/collections" className="inline-flex items-center gap-3 px-8 py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs uppercase tracking-[0.2em] font-bold rounded-full shadow-md transition-all">
              <span>Explore Collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
