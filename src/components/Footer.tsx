import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin, Phone } from 'lucide-react';
import { useAdminStore, cleanWhatsAppDigits } from '@/store/admin';
import { STORE_INSTAGRAM_URL, STORE_EMAIL, STORE_ADDRESS_FULL, STORE_PHONE } from '@/lib/constants';

export default function Footer() {
  const settings = useAdminStore((s) => s.settings);

  const categories = useAdminStore((s) => s.categories);

  const address = settings?.atelierAddress || STORE_ADDRESS_FULL;
  const phoneNumber = settings?.phoneNumber || STORE_PHONE;
  const whatsappDigits = cleanWhatsAppDigits(settings?.whatsappNumber);
  const instagramUrl = settings?.socialLinks?.instagram || STORE_INSTAGRAM_URL;
  const email = settings?.studio?.supportEmail || settings?.studio?.email || STORE_EMAIL;

  return (
    <footer className="border-t border-[#C5A059]/30 bg-[#F7F4EE] text-[#110B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <img src="/logo-light.png" alt="Azhai Clothing" className="h-14 w-auto object-contain" />
            <p className="text-xs text-[#6D6268] font-light leading-relaxed max-w-sm">
              An invitation to rediscover your inherent elegance through cloud-light organza, sacred maroon silks, and unbroken traditional craft.
            </p>
            <p className="font-script text-2xl text-[#701626]">— by Preethi</p>
            
              <div className="space-y-1.5 pt-1 text-xs text-[#6D6268]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#701626] shrink-0" />
                  <span>{address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#701626] shrink-0" />
                  <a href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`} className="hover:text-[#701626] font-medium">
                    Studio Phone: {phoneNumber}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0" />
                  <a
                    href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hi Preethi, I would like to inquire about Azhai Clothing.')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#701626] font-medium text-[#110B0E]"
                  >
                    WhatsApp Stylist: <strong className="text-[#25D366] font-semibold">{settings?.whatsappNumber || phoneNumber}</strong>
                  </a>
                </div>
              </div>

            <div className="flex gap-3 pt-2">
              <motion.a 
                href={`https://wa.me/${whatsappDigits}?text=${encodeURIComponent('Hi Preethi, I would like to inquire about Azhai Clothing.')}`} 
                target="_blank" 
                rel="noreferrer" 
                whileHover={{ scale: 1.08 }} 
                className="w-10 h-10 bg-white rounded-full text-[#701626] flex items-center justify-center border border-[#C5A059]/40 shadow-sm hover:bg-[#701626] hover:text-white transition-colors"
                title="WhatsApp Stylist Concierge"
                aria-label="WhatsApp Stylist Concierge"
              >
                <MessageCircle className="w-4 h-4" />
              </motion.a>
              <motion.a 
                href={instagramUrl} 
                target="_blank" 
                rel="noreferrer" 
                whileHover={{ scale: 1.08 }} 
                className="w-10 h-10 bg-white rounded-full text-[#701626] flex items-center justify-center border border-[#C5A059]/40 shadow-sm hover:bg-[#701626] hover:text-white transition-colors"
                title="Instagram Lookbook"
                aria-label="Instagram Lookbook"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </motion.a>
              <motion.a 
                href={`mailto:${email}`} 
                whileHover={{ scale: 1.08 }} 
                className="w-10 h-10 bg-white rounded-full text-[#701626] flex items-center justify-center border border-[#C5A059]/40 shadow-sm hover:bg-[#701626] hover:text-white transition-colors"
                title="Email Us"
                aria-label="Email Azhai Boutique"
              >
                <Mail className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">The Collections</p>
            <ul className="space-y-2">
              {categories && categories.length > 0 ? (
                categories.slice(0, 4).map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <Link to={`/collections/${cat.slug}`} className="text-xs text-[#6D6268] hover:text-[#701626] transition-colors font-medium">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : null}
              <li>
                <Link to="/collections" className="text-xs text-[#6D6268] hover:text-[#701626] transition-colors font-medium">
                  All Collections
                </Link>
              </li>
              <li>
                <Link to="/tailoring" className="text-xs text-[#6D6268] hover:text-[#701626] transition-colors font-medium">
                  Custom Tailoring
                </Link>
              </li>
              <li>
                <Link to="/story" className="text-xs text-[#6D6268] hover:text-[#701626] transition-colors font-medium">
                  Our Brand Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs text-[#6D6268] hover:text-[#701626] transition-colors font-medium">
                  Contact & Showroom
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">Customer Privileges</p>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/shipping-policy" className="text-[#6D6268] hover:text-[#701626] transition-colors">
                  Island-wide Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/returns-exchanges" className="text-[#6D6268] hover:text-[#701626] transition-colors">
                  14-Day Doorstep Exchanges
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#6D6268] hover:text-[#701626] transition-colors">
                  Bespoke Sizing Consultation
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-[#6D6268] hover:text-[#701626] transition-colors">
                  Privacy & Payment Security
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#6D6268] hover:text-[#701626] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li className="text-[#701626] font-semibold pt-1">
                Free Shipping Over LKR 15,000
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-14 pt-6 border-t border-[#C5A059]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#6D6268]">
          <p>© 2026 Azhai Clothing by Preethi (Sri Lanka). All rights reserved.</p>
          <p className="flex items-center gap-1 text-[#701626] font-medium">Crafted with 🪷 in Sri Lanka & Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
