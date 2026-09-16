import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Clock, Send, Sparkles, CheckCircle2, Phone, ExternalLink, PhoneCall } from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useAdminStore, cleanWhatsAppDigits } from '@/store/admin';
import { STORE_ADDRESS_FULL, STORE_PHONE, STORE_SUPPORT_EMAIL } from '@/lib/constants';
import { sendBrevoEmail } from '@/lib/brevo';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default function Contact() {
  const settings = useAdminStore((s) => s.settings);
  const [searchParams] = useSearchParams();

  const activeAddress = settings?.atelierAddress || STORE_ADDRESS_FULL;
  const activePhone = settings?.phoneNumber || STORE_PHONE;
  const activeWhatsApp = settings?.whatsappNumber || STORE_PHONE;
  const activeWhatsAppDigits = cleanWhatsAppDigits(activeWhatsApp);
  const activeEmail = settings?.studio?.supportEmail || STORE_SUPPORT_EMAIL;
  const activeHours = settings?.studio?.openingHours || 'Mon – Sat: 10:00 AM – 7:30 PM (Closed on Poya)';

  const initialOrder = searchParams.get('order');
  const initialRating = searchParams.get('rating');
  const initialTopic = searchParams.get('topic');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(() => {
    if (initialOrder || initialRating) return 'Order Feedback & Review';
    if (initialTopic) return initialTopic;
    return 'Bespoke Sizing & Styling';
  });
  const [message, setMessage] = useState(() => {
    if (initialOrder && initialRating) {
      return `Order Reference: ${initialOrder}\nCustomer Rating: ${initialRating} / 5 Stars ⭐\n\nReview & Fitting Experience: `;
    } else if (initialOrder) {
      return `Order Reference: ${initialOrder}\n\nInquiry regarding this order: `;
    }
    return '';
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = localStorage.getItem('azhai-inquiries');
      const list = stored ? JSON.parse(stored) : [];
      list.push({
        id: `inq_${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        topic: topic.trim(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('azhai-inquiries', JSON.stringify(list));

      // Sanitize fields before embedding into HTML email to prevent injection attacks
      const safeName = escapeHtml(name.trim());
      const safeEmail = escapeHtml(email.trim());
      const safePhone = escapeHtml(phone.trim() || 'Not provided');
      const safeTopic = escapeHtml(topic.trim());
      const safeMessage = escapeHtml(message.trim());

      // Send immediate email notification to Atelier management via Brevo
      sendBrevoEmail({
        to: [{ email: activeEmail, name: 'Azhai Atelier Operations' }],
        replyTo: { email: email.trim(), name: name.trim() },
        subject: `[Atelier Inquiry] ${safeTopic} — from ${safeName}`,
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FCFBF8; border: 1px solid #C5A059; border-radius: 16px;">
            <div style="border-bottom: 2px solid #701626; padding-bottom: 12px; margin-bottom: 18px;">
              <h2 style="color: #701626; margin: 0; font-size: 20px;">New Customer Inquiry</h2>
              <p style="color: #C5A059; margin: 4px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em;">Azhai Boutique Atelier</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
              <tr>
                <td style="padding: 6px 0; color: #6D6268; width: 120px;"><strong>Patron Name:</strong></td>
                <td style="padding: 6px 0; color: #110B0E;">${safeName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6D6268;"><strong>Email:</strong></td>
                <td style="padding: 6px 0;"><a href="mailto:${safeEmail}" style="color: #701626; font-weight: bold;">${safeEmail}</a></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6D6268;"><strong>Phone:</strong></td>
                <td style="padding: 6px 0; color: #110B0E;">${safePhone}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6D6268;"><strong>Inquiry Topic:</strong></td>
                <td style="padding: 6px 0; color: #701626; font-weight: bold;">${safeTopic}</td>
              </tr>
            </table>
            <div style="background: #ffffff; border: 1px solid #E6DEC9; border-radius: 12px; padding: 16px; margin-bottom: 18px;">
              <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #C5A059; font-weight: bold; margin-bottom: 6px;">Message Content</div>
              <p style="margin: 0; color: #110B0E; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</p>
            </div>
            <p style="font-size: 11px; color: #9E9399; margin: 0; text-align: center;">
              Submitted through the Azhai Boutique Concierge Form on ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}
            </p>
          </div>
        `,
      }).catch((err) => console.warn('[Brevo Inquiry Alert Exception]:', err));
    } catch (err) {
      console.warn('Inquiry storage error:', err);
    }
    setSubmitted(true);
  };

  const contactSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Azhai Atelier — Colombo, Sri Lanka',
    description: 'Get in touch with Preethi for bespoke bridal tailoring, custom sizing advice, or WhatsApp styling assistance.',
    url: 'https://azhaiclothing.lk/contact',
    mainEntity: {
      '@type': 'ClothingStore',
      name: 'Azhai Clothing by Preethi',
      telephone: activePhone,
      email: activeEmail,
      address: {
        '@type': 'PostalAddress',
        streetAddress: activeAddress,
        addressLocality: 'Colombo',
        postalCode: '00300',
        addressCountry: 'LK',
      },
    },
  }), [activeAddress, activePhone, activeEmail]);

  return (
    <div className="min-h-screen bg-[#FCFBF8] pt-32 sm:pt-36 pb-20 text-[#110B0E]">
      <SEOHead
        title="Contact Azhai Atelier — Bespoke Styling & Customer Care Colombo"
        description="Connect with Azhai Clothing by Preethi in Colombo. WhatsApp concierge, bespoke fitting inquiries, parcel dispatch updates, and showroom appointments."
        canonicalUrl="https://azhaiclothing.lk/contact"
        url="https://azhaiclothing.lk/contact"
        schema={contactSchema}
      />
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
                {activeAddress}<br />
                <span className="text-[11px] text-[#C5A059] font-medium">(Private showroom visits & bespoke fittings by appointment)</span>
              </p>
              <div className="pt-1 border-t border-[#C5A059]/20">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#701626] hover:underline cursor-pointer"
                >
                  <span>Open Directions in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Direct Voice & Support Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#C5A059]/30 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#701626]/10 text-[#701626] flex items-center justify-center">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#110B0E]">Direct Lines</h3>
                  <p className="text-xs text-[#6D6268] font-light">Voice Calls & Email Inquiries</p>
                </div>
              </div>
              <div className="text-xs space-y-2 text-[#6D6268]">
                <div className="flex items-center justify-between">
                  <span>Studio Phone:</span>
                  <a href={`tel:${activePhone}`} className="font-semibold text-[#110B0E] hover:text-[#701626] transition-colors">
                    {activePhone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span>Concierge Email:</span>
                  <a href={`mailto:${activeEmail}`} className="font-semibold text-[#110B0E] hover:text-[#701626] transition-colors">
                    {activeEmail}
                  </a>
                </div>
              </div>
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
                <p className="font-medium text-[#110B0E]">{activeHours}</p>
              </div>
            </div>

            {/* Fast WhatsApp Box */}
            <div className="bg-gradient-to-br from-[#701626] to-[#8E1E34] text-white rounded-3xl p-6 sm:p-7 border border-[#C5A059]/40 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#DFBF77]" />
                <h3 className="font-display text-xl font-bold">Instant WhatsApp Stylist</h3>
              </div>
              <p className="text-xs text-white/80 font-light leading-relaxed">
                Need urgent sizing advice, custom bridal consultation, or same-day dispatch assistance in Colombo? Message Preethi directly on WhatsApp ({activeWhatsApp}).
              </p>
              <a
                href={`https://wa.me/${activeWhatsAppDigits}?text=${encodeURIComponent('Hello Preethi! I would like to inquire about an Azhai piece.')}`}
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
                    <label htmlFor="contact-name" className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Your Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ananya Senanayake"
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
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
                    <label htmlFor="contact-phone" className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Phone (Optional)
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-topic" className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                      Subject / Topic
                    </label>
                    <select
                      id="contact-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-[#F7F4EE]/70 border border-[#C5A059]/30 text-xs focus:border-[#701626] focus:bg-white focus:outline-none"
                    >
                      <option value="Bespoke Sizing & Styling">Bespoke Sizing & Styling Advice</option>
                      <option value="Wedding & Bridal Inquiries">Wedding & Bridal Trousseau Orders</option>
                      <option value="Order Tracking & Dispatch">Order Tracking & Dispatch Updates</option>
                      <option value="Exchange & Returns">14-Day Doorstep Exchange Request</option>
                      <option value="Order Feedback & Review">Order Feedback & Review</option>
                      <option value="Other Inquiries">Other Inquiries</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="block text-xs font-bold text-[#110B0E] uppercase tracking-wider">
                    Your Message *
                  </label>
                  <textarea
                    id="contact-message"
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
