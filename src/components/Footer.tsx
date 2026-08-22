import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, MapPin } from 'lucide-react';

export default function Footer() {
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
            
            <div className="flex items-center gap-2 text-xs text-[#6D6268] pt-1">
              <MapPin className="w-4 h-4 text-[#701626] shrink-0" />
              <span>Colombo Atelier & Island-wide Delivery across Sri Lanka</span>
            </div>

            <div className="flex gap-3 pt-2">
              <motion.a 
                href="https://wa.me/?text=Hi%20Preethi%2C%20I%20would%20like%20to%20inquire%20about%20Azhai%20Clothing." 
                target="_blank" 
                rel="noreferrer" 
                whileHover={{ scale: 1.08 }} 
                className="w-10 h-10 bg-white rounded-full text-[#701626] flex items-center justify-center border border-[#C5A059]/40 shadow-sm hover:bg-[#701626] hover:text-white transition-colors"
                title="WhatsApp Stylist Concierge"
              >
                <MessageCircle className="w-4 h-4" />
              </motion.a>
              <motion.a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                whileHover={{ scale: 1.08 }} 
                className="w-10 h-10 bg-white rounded-full text-[#701626] flex items-center justify-center border border-[#C5A059]/40 shadow-sm hover:bg-[#701626] hover:text-white transition-colors"
                title="Instagram Lookbook"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </motion.a>
              <motion.a 
                href="mailto:hello@azhai.lk" 
                whileHover={{ scale: 1.08 }} 
                className="w-10 h-10 bg-white rounded-full text-[#701626] flex items-center justify-center border border-[#C5A059]/40 shadow-sm hover:bg-[#701626] hover:text-white transition-colors"
                title="Email Us"
              >
                <Mail className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">The Collections</p>
            <ul className="space-y-2">
              {[
                ['/collections/kurties', 'Kurties & Sets'],
                ['/collections/sarees', 'Sarees'],
                ['/collections/shawls', 'Shawls & Wraps'],
                ['/collections/tops', 'Tops & Bustiers'],
                ['/story', 'Our Brand Story']
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-xs text-[#6D6268] hover:text-[#701626] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#701626] font-bold">Customer Privileges</p>
            <ul className="space-y-2 text-xs text-[#6D6268]">
              <li>Island-wide Delivery (PromptX / Koombiyo)</li>
              <li>Free Shipping Over LKR 15,000</li>
              <li>14-Day Doorstep Exchanges</li>
              <li>Cash on Delivery (COD) Available</li>
              <li>Bespoke Sizing Consultation</li>
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
