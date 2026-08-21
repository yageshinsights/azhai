import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, RotateCcw, ShoppingBag, Crown } from 'lucide-react';
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
      { label: '🥂 Sunset Sangeet & Cocktails', subtitle: 'Evening glam & slow-mo twirls', era: 'drama' },
      { label: '🪷 Intimate Temple Pooja & Haldi', subtitle: 'Sacred temple silk rituals', era: 'minimalist' },
      { label: '✨ Best Friend’s Day Wedding', subtitle: 'Dreamy outdoor golden hour', era: 'romantic' },
    ]
  }
];

const RESULTS: Record<string, { title: string; desc: string; piece: string; price: string; slug: string; id: number; image: string }> = {
  romantic: {
    title: 'The Dreamy Romantic Muse',
    desc: 'You love cloud-light drapes, candid laughter, and ethereal silhouettes that look like poetry under sunset light.',
    piece: 'Sheer Organza Peplum Blouse Top',
    price: 'LKR 9,800',
    slug: 'sheer-organza-peplum-top',
    id: 302,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=90'
  },
  minimalist: {
    title: 'The Modern Heritage Icon',
    desc: 'You appreciate clean lines, tailored corset cuts, and sacred handloom crimson silks with effortless poise.',
    piece: 'Maroon Corset Handloom Kurti Set',
    price: 'LKR 14,500',
    slug: 'maroon-corset-kurti-set',
    id: 101,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=90'
  },
  drama: {
    title: 'The Sangeet Showstopper',
    desc: 'You came to twirl. Heavy 32-kali volume, handcrafted thread cords, and unmatched main character energy.',
    piece: '32-Kali Twirl Raw Silk Shalwar Suit',
    price: 'LKR 28,500',
    slug: 'raw-silk-shalwar-suit',
    id: 201,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=90'
  }
};

export default function StyleQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEra, setSelectedEra] = useState<string>('minimalist');
  const [isFinished, setIsFinished] = useState(false);
  const [added, setAdded] = useState(false);

  const { addItem } = useCartStore();

  const handleSelectOption = (era: string) => {
    setSelectedEra(era);
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsFinished(false);
    setAdded(false);
  };

  const result = RESULTS[selectedEra] || RESULTS.minimalist;

  const handleAddResult = () => {
    addItem({
      id: result.id,
      name: result.piece,
      price: result.price,
      image: result.image,
      quantity: 1,
      size: 'M',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section id="quiz" className="py-20 px-4 sm:px-8 max-w-4xl mx-auto relative z-10 scroll-mt-24">
      
      <div className="rounded-[2.5rem] bg-[#F7F4EE] border border-[#C5A059]/40 shadow-xl p-6 sm:p-10 lg:p-12 text-center space-y-6">
        
        {/* Top Tag */}
        <div className="inline-flex items-center gap-2 text-[#701626] text-[10px] font-bold uppercase tracking-[0.25em] bg-white px-4 py-1.5 rounded-full border border-[#C5A059]/40 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>Interactive Silhouette Matcher</span>
        </div>

        <div className="space-y-1">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#110B0E]">
            Find Your Festive Era
          </h2>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light">
            Answer 2 quick questions to reveal your curated silhouette matched by Preethi.
          </p>
        </div>

        {/* Dynamic Quiz Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C5A059]/30 shadow-sm max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {!isFinished ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <span className="text-[10px] uppercase tracking-widest text-[#701626] font-bold">
                  Question {currentStep + 1} of {QUESTIONS.length}
                </span>

                <h3 className="font-display text-2xl font-bold text-[#110B0E]">
                  {QUESTIONS[currentStep].question}
                </h3>

                <div className="space-y-3">
                  {QUESTIONS[currentStep].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(opt.era)}
                      className="w-full p-4 rounded-2xl bg-[#FCFBF8] hover:bg-[#701626]/5 border border-[#C5A059]/30 hover:border-[#701626]/40 transition-all text-left space-y-0.5 group"
                    >
                      <p className="text-xs sm:text-sm font-bold text-[#110B0E] group-hover:text-[#701626] transition-colors">
                        {opt.label}
                      </p>
                      {opt.subtitle && (
                        <p className="text-[11px] text-[#6D6268] font-light">{opt.subtitle}</p>
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
                className="space-y-6"
              >
                <div className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest text-[#701626] font-bold bg-[#701626]/10 px-3 py-1 rounded-full">
                  <Crown className="w-3 h-3 text-[#C5A059]" />
                  <span>Your Aesthetic Match</span>
                </div>

                <div className="space-y-2">
                  <h3 className="font-display text-3xl font-bold text-[#110B0E]">{result.title}</h3>
                  <p className="text-xs text-[#6D6268] leading-relaxed font-light">{result.desc}</p>
                </div>

                {/* Matched Product Box */}
                <div className="p-4 rounded-2xl bg-[#FCFBF8] border border-[#C5A059]/40 flex items-center gap-4 text-left">
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm border border-[#C5A059]/30">
                    <img src={result.image} alt={result.piece} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-[#701626] font-bold">Curated For You</span>
                    <h4 className="font-display text-base font-bold text-[#110B0E] leading-tight line-clamp-1">{result.piece}</h4>
                    <p className="font-display text-base font-bold text-[#701626]">{result.price}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddResult}
                    className={`flex-1 py-3.5 text-xs uppercase tracking-wider font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all ${
                      added ? 'bg-emerald-700 text-white' : 'bg-[#701626] hover:bg-[#8E1E34] text-white'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{added ? 'Added to Bag!' : `Quick Add (${result.price})`}</span>
                  </button>

                  <Link
                    to={`/products/${result.slug}`}
                    className="px-5 py-3.5 bg-white hover:bg-[#F7F4EE] border border-[#C5A059]/40 text-[#110B0E] text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>View Piece</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={handleReset}
                    className="p-3.5 text-[#6D6268] hover:text-[#110B0E] rounded-xl flex items-center justify-center transition-colors border border-[#C5A059]/30"
                    title="Retake Quiz"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </section>
  );
}
