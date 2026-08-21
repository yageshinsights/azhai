import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cart';

interface QuizOption {
  label: string;
  subtitle?: string;
  era: string;
}

interface Question {
  question: string;
  options: QuizOption[];
}

const QUESTIONS: Question[] = [
  {
    question: "What's your dream festive aesthetic?",
    options: [
      { label: '🌸 Dreamy Golden Hour Organza', subtitle: 'Translucent drapes & soft pastel tones', era: 'romantic' },
      { label: '🔥 Modern Corset & Sacred Silks', subtitle: 'Fitted silhouettes & bold temple maroon', era: 'minimalist' },
      { label: '💃 Full Sangeet Twirl Drama', subtitle: '32-kali volume & heirloom threadwork', era: 'drama' },
    ]
  },
  {
    question: "Where are you making an entrance?",
    options: [
      { label: '🥂 Sunset Sangeet & Cocktails', subtitle: 'Evening glam & cocktails', era: 'drama' },
      { label: '🪷 Intimate Temple Pooja & Haldi', subtitle: 'Sacred temple silk rituals', era: 'minimalist' },
      { label: '✨ Best Friend’s Day Wedding', subtitle: 'Dreamy outdoor golden hour', era: 'romantic' },
    ]
  }
];

const RESULTS: Record<string, { title: string; desc: string; piece: string; price: string; slug: string; id: number; image: string }> = {
  romantic: {
    title: 'The Dreamy Romantic Muse',
    desc: 'You love cloud-light drapes, candid laughter, and ethereal silhouettes that look like poetry under sunset light.',
    piece: 'Dreamy Ivory Lotus Organza Saree',
    price: '₹12,800',
    slug: 'ivory-lotus-organza-saree',
    id: 102,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90'
  },
  minimalist: {
    title: 'The Modern Heritage Icon',
    desc: 'You appreciate clean lines, tailored corset cuts, and sacred handloom crimson silks with effortless poise.',
    piece: 'Maroon Kanjivaram Corset Kurta Set',
    price: '₹8,499',
    slug: 'maroon-kanjivaram-kurta-set',
    id: 101,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90'
  },
  drama: {
    title: 'The Sangeet Showstopper',
    desc: 'You came to twirl. Heavy 32-kali volume, handcrafted thread cords, and unmatched main character energy.',
    piece: '32-Kali Twirl Raw Silk Anarkali',
    price: '₹15,500',
    slug: 'raw-silk-anarkali',
    id: 103,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90'
  }
};

export default function StyleQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const { addItem } = useCartStore();

  const handleSelect = (era: string) => {
    const nextAnswers = [...answers, era];
    setAnswers(nextAnswers);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      setStep(QUESTIONS.length);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
  };

  const chosenEra = answers[0] || 'romantic';
  const result = RESULTS[chosenEra] || RESULTS.romantic;

  return (
    <section className="py-20 px-5 sm:px-8 max-w-4xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-b from-[#F4EFEA] to-white p-6 sm:p-12 border border-[#E8D7B5]/60 shadow-[0_20px_50px_rgba(70,40,50,0.06)] text-center space-y-8">
        
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.3em] text-[#7B1C2E] font-bold bg-[#7B1C2E]/8 px-3.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>Interactive Matcher</span>
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1C1318]">
            What's your festive personality?
          </h2>
          <p className="text-xs sm:text-sm text-[#7A6D74] max-w-md mx-auto font-light">
            Take 30 seconds to discover the Azhai silhouette made for your specific mood.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step < QUESTIONS.length ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-[#7B1C2E]">
                Question 0{step + 1} of 0{QUESTIONS.length}
              </p>
              <h3 className="font-display text-2xl font-bold text-[#1C1318]">
                {QUESTIONS[step].question}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                {QUESTIONS[step].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt.era)}
                    className="p-5 rounded-2xl bg-white border border-[#E8D7B5]/80 hover:border-[#7B1C2E] text-left transition-all duration-300 shadow-sm hover:shadow-md group space-y-1"
                  >
                    <p className="text-sm font-bold text-[#1C1318] group-hover:text-[#7B1C2E] transition-colors leading-tight">
                      {opt.label}
                    </p>
                    {opt.subtitle && (
                      <p className="text-[11px] text-[#7A6D74] font-light leading-snug">{opt.subtitle}</p>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 text-left"
            >
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8D7B5] shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                
                <div className="sm:col-span-4 rounded-2xl overflow-hidden aspect-[4/5] bg-[#F4EFEA]">
                  <img src={result.image} alt={result.piece} className="w-full h-full object-cover" />
                </div>

                <div className="sm:col-span-8 space-y-4">
                  <span className="text-[10px] uppercase tracking-widest text-[#7B1C2E] font-bold bg-[#7B1C2E]/10 px-3 py-1 rounded-full">
                    ✨ Your Matched Aesthetic
                  </span>
                  
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#1C1318]">
                    {result.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-[#7A6D74] font-light leading-relaxed">
                    {result.desc}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      to={`/products/${result.slug}`}
                      className="px-6 py-3 bg-[#7B1C2E] hover:bg-[#9B2D42] text-white text-xs uppercase tracking-wider font-bold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <span>Shop {result.piece} ({result.price})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    
                    <button
                      onClick={handleReset}
                      className="px-4 py-3 bg-[#F4EFEA] hover:bg-[#E8D7B5]/40 text-[#1C1318] text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake Quiz</span>
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
