import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Waves,
  Feather,
  Shirt,
  Scissors,
  CheckCircle2,
  Crown,
  HeartHandshake,
  MessageCircle,
  Gem,
  Award,
} from 'lucide-react';
import AnimatedLogo from '@/components/AnimatedLogo';
import SEOHead from '@/components/SEOHead';
import { getWhatsAppUrl } from '@/lib/constants';

export default function Story() {
  const storySchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'The Story of Azhai — The Wave of Unbroken Elegance',
      description:
        'In Tamil, Azhai (அலை) means the ocean wave. Discover Preethi’s journey from TV presenter to atelier founder, screen-tested festive couture, handpicked pure silks, and bespoke Colombo tailoring.',
      url: 'https://azhaiclothing.lk/story',
      publisher: {
        '@type': 'ClothingStore',
        name: 'Azhai Clothing by Preethi',
        logo: 'https://azhaiclothing.lk/logo-light.png',
        founder: {
          '@type': 'Person',
          name: 'Preethi',
          jobTitle: 'Founder & Creative Director',
        },
      },
    }),
    []
  );

  const whatsappHref = getWhatsAppUrl(
    'Hello Preethi! I just read the Azhai story and would love to consult with you on your collections.'
  );

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#110B0E] selection:bg-[#701626] selection:text-white pt-28 sm:pt-32 pb-20">
      <SEOHead
        title="The Story of Azhai — The Wave of Unbroken Elegance | By Preethi"
        description="In Tamil, Azhai (அலை) means the ocean wave. From TV presenter to atelier founder, discover screen-tested couture, pure mulberry silks, and in-house bespoke tailoring in Colombo."
        canonicalUrl="https://azhaiclothing.lk/story"
        url="https://azhaiclothing.lk/story"
        schema={storySchema}
      />

      {/* ────────────────────────────────────────────────────────────
          1. HERO: THE WAVE OF UNBROKEN ELEGANCE
      ──────────────────────────────────────────────────────────── */}
      <section className="relative px-5 sm:px-8 pt-10 pb-16 sm:pb-24 text-center overflow-hidden">
        {/* Subtle decorative background wave gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#C5A059]/15 via-[#701626]/5 to-transparent blur-3xl rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-4xl mx-auto space-y-6"
        >
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.25em] text-[#701626] font-bold bg-[#701626]/8 px-4 py-1.5 rounded-full border border-[#C5A059]/35 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>The Wave of Unbroken Elegance</span>
          </div>

          {/* Interactive 3D Animated Logo */}
          <div className="py-3 flex justify-center">
            <AnimatedLogo size="xl" withAura={true} replayable={true} />
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#F7F4EE] px-3.5 py-1 rounded-full border border-[#C5A059]/30 text-xs font-semibold text-[#701626]">
              <span className="font-serif text-sm">அலை</span>
              <span className="text-[#6D6268]">•</span>
              <span>The Ocean Wave</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold text-[#110B0E] tracking-tight leading-tight">
              The Story of Azhai
            </h1>
            <p className="font-script text-2xl sm:text-3xl text-[#701626]">
              A journey from studio lights to the atelier — crafted by Preethi
            </p>
          </div>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#6D6268] font-light leading-relaxed pt-2">
            Fashion that never stands still. Born from a refusal to accept uncomfortable celebratory wear, crafted with weightless handpicked silks, and tailored for real South Asian proportions.
          </p>
        </motion.div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          2. THE MEANING OF THE NAME: THE WAVE THAT NEVER STOPS
      ──────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-5 sm:px-8 border-y border-[#C5A059]/20 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
              The Meaning of the Name
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              The Wave That Never Stops
            </h2>
            <p className="text-sm text-[#6D6268] font-light leading-relaxed">
              In Tamil, <strong className="text-[#701626] font-medium">Azhai (அலை)</strong> means the ocean wave. A wave never stands still. It gathers strength from the deep ocean, rises with quiet power, and rolls forward in an endless, rhythmic surge.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pt-4">
            {/* Pillar 1: Non-Stopping Collections */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 rounded-3xl bg-[#FCFBF8] border border-[#C5A059]/35 shadow-sm space-y-4 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center border border-[#701626]/20">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#110B0E]">
                Non-Stopping Collections
              </h3>
              <p className="text-sm text-[#6D6268] font-light leading-relaxed">
                Just like ocean waves meeting the shore, our collections arrive in a continuous rhythm of fresh capsule drops, new palettes, and celebratory cuts throughout the year. We do not believe in stagnant seasonal racks.
              </p>
            </motion.div>

            {/* Pillar 2: Fabric That Moves Like Water */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-8 rounded-3xl bg-[#FCFBF8] border border-[#C5A059]/35 shadow-sm space-y-4 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/15 text-[#701626] flex items-center justify-center border border-[#C5A059]/30">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-[#110B0E]">
                Fabric That Moves Like Water
              </h3>
              <p className="text-sm text-[#6D6268] font-light leading-relaxed">
                Clothing should never feel like a stiff cage. We cut and tailor our garments so the fabric flows naturally with your body—light, breathable, and effortless, whether you are hosting an intimate soiree or dancing at a family wedding.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          3. THE FOUNDER'S JOURNEY: FROM STUDIO LIGHTS TO THE ATELIER
      ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 bg-[#F7F4EE]/60">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-3xl p-8 sm:p-14 border border-[#C5A059]/40 shadow-xl space-y-8 relative overflow-hidden"
          >
            {/* Watermark Crest Accent */}
            <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-5 pointer-events-none">
              <img src="/logo-gold.png" alt="Azhai Crest" className="w-72 h-72" />
            </div>

            <div className="space-y-2 border-b border-[#C5A059]/20 pb-6">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
                  The Founder's Journey
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-[#701626] bg-[#701626]/5 px-3 py-1 rounded-full border border-[#701626]/15 font-medium">
                  <Award className="w-3.5 h-3.5 text-[#C5A059]" />
                  A note by Preethi
                </span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
                From Studio Lights to the Atelier
              </h2>
            </div>

            {/* Founder Quote Body */}
            <div className="space-y-6 text-[#110B0E]/90 text-sm sm:text-base leading-relaxed font-light">
              <p className="italic text-base sm:text-lg text-[#110B0E] font-normal leading-relaxed border-l-2 border-[#701626] pl-4 sm:pl-6 my-2">
                "As a TV presenter and model, styling and wardrobe were a part of my daily life in front of the lens."
              </p>

              <p>
                Under high-definition cameras and blinding studio lights, I experienced firsthand what every woman secretly battles with at celebrations: festive wear was suffocating. Heavy synthetic polyesters that trapped tropical heat, shoulders that pinched, waistlines cut on stiff factory mannequins that completely ignored South Asian curves, and safety pins holding garments together behind the scenes.
              </p>

              <div className="p-5 sm:p-6 rounded-2xl bg-[#701626]/5 border border-[#701626]/20 text-[#701626] font-serif text-base sm:text-lg italic">
                "I asked myself a simple question: Why must women suffer to look radiant? Why should celebrating our culture feel like wearing an uncomfortable costume?"
              </div>

              <p className="font-medium text-[#110B0E]">
                I created Azhai to give women camera-ready, screen-tested couture that feels as light and free as ocean water on the skin.
              </p>
            </div>

            {/* Signature Block */}
            <div className="pt-4 flex items-center justify-between flex-wrap gap-4 border-t border-[#C5A059]/20">
              <div>
                <p className="font-script text-3xl sm:text-4xl text-[#701626]">
                  Preethi
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6D6268] font-bold">
                  Founder & Creative Director
                </p>
              </div>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#701626] hover:text-[#8E1E34] transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Message Preethi on WhatsApp</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          4. THE FABRIC TRUTH: HANDPICKED ACROSS SRI LANKA & INDIA
      ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-5 sm:px-8 bg-white border-y border-[#C5A059]/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
              Pure Textile Honesty
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              The Fabric Truth: Handpicked Across Sri Lanka & India
            </h2>
            <p className="text-sm text-[#6D6268] font-light leading-relaxed">
              We do not buy generic, wholesale synthetic fabrics. Preethi personally handpicks high-grade textiles directly from the traditional weaving hubs of Sri Lanka and India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fabric 1: Pure Mulberry Silks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#FCFBF8] border border-[#C5A059]/30 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#C5A059] transition-all"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                  <Gem className="w-5 h-5 text-[#C5A059]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#110B0E]">
                  Pure Mulberry Silks
                </h3>
                <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
                  Naturally temperature-regulating, weightless, with a soft sheen that catches natural golden sunlight without artificial metallic glare.
                </p>
              </div>
              <div className="pt-4 border-t border-[#C5A059]/20 text-[11px] font-semibold text-[#701626] uppercase tracking-wider">
                Breathable • Golden Sheen
              </div>
            </motion.div>

            {/* Fabric 2: Featherlight Organza */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#FCFBF8] border border-[#C5A059]/30 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#C5A059] transition-all"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                  <Feather className="w-5 h-5 text-[#C5A059]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#110B0E]">
                  Featherlight Organza
                </h3>
                <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
                  Sheer, structured, and cloud-light for contemporary drapes that hold crisp silhouette lines while feeling completely weightless.
                </p>
              </div>
              <div className="pt-4 border-t border-[#C5A059]/20 text-[11px] font-semibold text-[#701626] uppercase tracking-wider">
                Cloud-Light • Architectural
              </div>
            </motion.div>

            {/* Fabric 3: 100% Natural Handloom Cottons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 sm:p-8 rounded-3xl bg-[#FCFBF8] border border-[#C5A059]/30 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#C5A059] transition-all"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                  <Shirt className="w-5 h-5 text-[#C5A059]" />
                </div>
                <h3 className="font-display text-xl font-bold text-[#110B0E]">
                  100% Natural Handloom Cottons
                </h3>
                <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
                  Hand-spun and woven by master artisans across Sri Lanka, designed specifically to breathe effortlessly through warm tropical celebrations.
                </p>
              </div>
              <div className="pt-4 border-t border-[#C5A059]/20 text-[11px] font-semibold text-[#701626] uppercase tracking-wider">
                Artisan Handloom • Tropical Ease
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          5. THE IN-HOUSE DIFFERENCE: STITCHED IN OUR OWN GARMENT ATELIER
      ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8 bg-[#FCFBF8]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
              Colombo Atelier Craftsmanship
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              The In-House Difference: Stitched in Our Own Garment Atelier
            </h2>
            <p className="text-sm text-[#6D6268] font-light leading-relaxed">
              Most online fashion brands are middle-men reselling mass-produced factory clothes. We do things differently. Every Azhai piece is cut, tailored, and hand-finished in our own dedicated garment atelier in Colombo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Difference 1 */}
            <div className="p-7 rounded-3xl bg-white border border-[#C5A059]/35 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                The Perfect South Asian Fit
              </h3>
              <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
                We cut our patterns specifically for real South Asian proportions. That means zero pulling across the bust, no shoulder slipping, and armholes with zero pinching.
              </p>
            </div>

            {/* Difference 2 */}
            <div className="p-7 rounded-3xl bg-white border border-[#C5A059]/35 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                Dual Sizing Options
              </h3>
              <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
                Choose our ready-to-wear sizes from S to XXL, or have your piece bespoke custom-stitched to your exact bust, waist, and length measurements in our atelier.
              </p>
              <Link
                to="/tailoring"
                className="inline-flex items-center gap-1.5 text-xs text-[#701626] font-bold hover:underline pt-2"
              >
                <span>Visit Custom Tailoring Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Difference 3 */}
            <div className="p-7 rounded-3xl bg-white border border-[#C5A059]/35 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#701626] text-[#F3E8CE] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-display text-xl font-bold text-[#110B0E]">
                100% Quality Ownership
              </h3>
              <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
                Every seam, inner lining, and neckline stitch is inspected by hand before it ever leaves our studio. Nothing is packed without our master tailor’s personal sign-off.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          6. THE STORY BEHIND THE CREST (LOGO)
      ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 px-5 sm:px-8 bg-[#F7F4EE] border-y border-[#C5A059]/25">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">
              Visual Identity & Heritage
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
              The Story Behind the Crest
            </h2>
            <p className="text-sm text-[#6D6268] font-light leading-relaxed">
              Every curve of the Azhai insignia carries deliberate meaning, blending maritime flow with time-honored artisanal iconography.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Crest Item 1 */}
            <div className="p-6 rounded-3xl bg-white border border-[#C5A059]/30 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                <Waves className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#110B0E]">
                The Sweeping Wave 'A'
              </h3>
              <p className="text-xs text-[#6D6268] font-light leading-relaxed">
                The flourish on our initial 'A' curves fluidly beneath the wordmark, symbolizing both the crest of an ocean wave and the continuous, unbroken thread of artisan weaving.
              </p>
            </div>

            {/* Crest Item 2 */}
            <div className="p-6 rounded-3xl bg-white border border-[#C5A059]/30 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#110B0E]">
                The 16-Petal Lotus Crown
              </h3>
              <p className="text-xs text-[#6D6268] font-light leading-relaxed">
                Crowning the letter 'i', the blooming lotus represents purity, auspicious beginnings, and calm poise rising serenely above the water.
              </p>
            </div>

            {/* Crest Item 3 */}
            <div className="p-6 rounded-3xl bg-white border border-[#C5A059]/30 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-display text-lg font-bold text-[#110B0E]">
                "by Preethi" Signature
              </h3>
              <p className="text-xs text-[#6D6268] font-light leading-relaxed">
                An intimate signature script, marking personal curation and inspection from sketchpad to stitch. A promise that every garment has been approved by the founder herself.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          7. CALL TO ACTION SECTION: STEP INTO THE WAVE
      ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-5 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-[#701626] text-[#F3E8CE] rounded-3xl p-8 sm:p-14 text-center border border-[#C5A059]/40 shadow-2xl space-y-6 relative overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C5A059] blur-3xl rounded-full" />
            </div>

            <div className="relative z-10 space-y-4 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-[#C5A059] font-bold bg-white/10 px-3 py-1 rounded-full border border-white/15">
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>Begin Your Journey</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-bold text-white tracking-tight">
                Step Into the Wave
              </h2>
              <p className="text-sm sm:text-base text-[#F3E8CE]/80 font-light leading-relaxed">
                Explore our latest capsule drop of handpicked festive couture and minimal co-ords.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/collections"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-white text-[#701626] hover:bg-[#F3E8CE] text-xs uppercase tracking-[0.2em] font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
                >
                  <span>Explore Collections</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#25D366] text-white hover:bg-[#20ba59] text-xs uppercase tracking-[0.15em] font-bold rounded-2xl shadow-lg transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat With Preethi on WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
