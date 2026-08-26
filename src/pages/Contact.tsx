import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Clock, Send, Sparkles, CheckCircle2, Phone } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('Bespoke Sizing & Styling');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-24 pb-20 text-[#110B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 mb-14 max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#701626] font-bold bg-[#701626]/8 border border-[#C5A059]/30 px-4 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Atelier Concierge</span>
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#110B0E]">
            Contact Azhai Atelier
          </h1>
          <p className="text-xs sm:text-sm text-[#6D6268] font-light leading-relaxed">
            Whether you desire bespoke bridal consultations, custom sizing adjustments, or parcel dispatch updates, Preethi & the atelier team are delighted to assist.
          </p>
        </motion.div>

        {/* 2-Column Split: Info Cards + Interactive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          
          {/* Left Column: Contact Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Atelier Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#C5A059]/30 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#110B0E]">Colombo Atelier</h3>
                  <p className="text-xs text-[#6D6268] font-light">Western Province, Sri Lanka</p>
                </div>
              </div>
              <p className="text-xs text-[#6D6268] leading-relaxed">
                42/A Temple Road, Kollupitiya, Colombo 03, Sri Lanka.<br />
                <span className="text-[11px] text-[#C5A059] font-medium">(Private showroom visits by prior appointment)</span>
              </p>
            </div>

            {/* Operating Hours */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#C5A059]/30 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#110B0E]">Concierge Hours</h3>
                  <p className="text-xs text-[#6D6268] font-light">Sri Lanka Standard Time (GMT+5:30)</p>
                </div>
              </div>
              <div className="text-xs space-y-1 text-[#6D6268]">
                <p><strong className="text-[#110B0E]">Monday – Saturday:</strong> 10:00 AM – 7:30 PM</p>
                <p><strong className="text-[#110B0E]">Sunday:</strong> 11:00 AM – 5:00 PM</p>
              </div>
            </div>

            {/* Fast WhatsApp Box */}
            <div className="bg-gradient-to-br from-[#701626] to-[#8E1E34] text-white rounded-3xl p-6 sm:p-7 border border-[#C5A059]/40 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#DFBF77]" />
                <h3 className="font-display text-xl font-bold">Instant WhatsApp Stylist</h3>
              </div>
              <p className="text-xs text-white/80 font-light leading-relaxed">
                Need urgent sizing advice or same-day dispatch assistance in Colombo? Message Preethi directly on WhatsApp.
              </p>
              <a
                href="https://wa.me/?text=Hello%20Preethi!%20I%20would%20like%20to%20inquire%20about%20an%20Azhai%20piece."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:bg-[#20bd5a] transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Right Column: Inquiry Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 border border-[#C5A059]/35 shadow-sm">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-16 text-center space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-2xl font-bold text-emerald-950">
                    Message Received
                  </h3>
                  <p className="text-xs text-emerald-800 font-light max-w-sm mx-auto leading-relaxed">
                    Thank you, {name}. Preethi will personally review your inquiry and reach back within 24 hours.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-[#701626] text-white text-xs font-bold uppercase tracking-wider rounded-2xl"
                >
                  Send Another Note
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <h3 className="font-display text-2xl font-bold text-[#110B0E]">Send a Message</h3>
                  <p className="text-xs text-[#6D6268] font-light">
                    Fill in your details below and our team will get back to you promptly.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ananya Senanayake"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Subject / Topic
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    >
                      <option value="Bespoke Sizing & Styling">Bespoke Sizing & Styling Advice</option>
                      <option value="Wedding & Bridal Inquiries">Wedding & Bridal Trousseau Orders</option>
                      <option value="Order Tracking & Dispatch">Order Tracking & Dispatch Updates</option>
                      <option value="Exchange & Returns">14-Day Doorstep Exchange Request</option>
                      <option value="Other Inquiries">Other Inquiries</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Your Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about the pieces you are interested in, your sizing queries, or required celebration dates..."
                    rows={4}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#701626] hover:bg-[#8E1E34] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Send Note to Preethi
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
