import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-[#E8D7B5]/60 bg-[#F4EFEA] text-[#1C1318]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-4">
            <img src="/logo-light.png" alt="Azhai Clothing" className="h-14 w-auto object-contain" />
            <p className="text-xs text-[#7A6D74] font-light leading-relaxed max-w-sm">
              An invitation to rediscover your inherent elegance through cloud-light organza, sacred maroon dyes, and unbroken handloom traditions.
            </p>
            <p className="font-script text-2xl text-[#7B1C2E]">— by Preethi</p>
            <div className="flex gap-3 pt-2">
              <motion.a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noreferrer" 
                whileHover={{ scale: 1.1 }} 
                className="w-9 h-9 bg-white rounded-full text-[#7B1C2E] flex items-center justify-center border border-[#E8D7B5]/60 shadow-sm"
              >
                <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </motion.a>
              <motion.a 
                href="mailto:hello@azhai.in" 
                whileHover={{ scale: 1.1 }} 
                className="w-9 h-9 bg-white rounded-full text-[#7B1C2E] flex items-center justify-center border border-[#E8D7B5]/60 shadow-sm"
              >
                <Mail className="w-4 h-4" />
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#7B1C2E] font-bold">The Boutique</p>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/collections', 'All Collections'], ['/story', 'The Brand Story']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-xs text-[#7A6D74] hover:text-[#7B1C2E] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#7B1C2E] font-bold">Customer Care</p>
            <ul className="space-y-2">
              {[['Complimentary Shipping', '#'], ['14-Day Exchanges', '#'], ['Bespoke Sizing', '#'], ['Contact Preethi', 'mailto:hello@azhai.in']].map(([label, href]) => (
                <li key={label}>
                  <a href={href} className="text-xs text-[#7A6D74] hover:text-[#7B1C2E] transition-colors">{label}</a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-14 pt-6 border-t border-[#E8D7B5]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#7A6D74]">
          <p>© 2026 Azhai Clothing by Preethi. All rights reserved.</p>
          <p className="flex items-center gap-1">Woven with 🪷 in Tamil Nadu</p>
        </div>
      </div>
    </footer>
  );
}
