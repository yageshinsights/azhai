import React from 'react';

export interface BankPreset {
  key: string;
  name: string;
  shortName: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  swiftCode?: string;
  defaultBranch?: string;
}

export const SRI_LANKA_BANKS_PRESETS: BankPreset[] = [
  {
    key: 'combank',
    name: 'Commercial Bank of Ceylon',
    shortName: 'ComBank',
    primaryColor: '#0A3B7B',
    secondaryColor: '#C49A45',
    textColor: '#FFFFFF',
    swiftCode: 'CCEYLKX',
    defaultBranch: 'Kollupitiya Branch',
  },
  {
    key: 'hnb',
    name: 'Hatton National Bank (HNB)',
    shortName: 'HNB',
    primaryColor: '#E65100',
    secondaryColor: '#002E6E',
    textColor: '#FFFFFF',
    swiftCode: 'HBLILKLX',
    defaultBranch: 'Cinnamon Gardens Branch',
  },
  {
    key: 'sampath',
    name: 'Sampath Bank PLC',
    shortName: 'Sampath',
    primaryColor: '#D8232A',
    secondaryColor: '#F58220',
    textColor: '#FFFFFF',
    swiftCode: 'BSAMLKLX',
    defaultBranch: 'Colombo Main Branch',
  },
  {
    key: 'boc',
    name: 'Bank of Ceylon (BOC)',
    shortName: 'BOC',
    primaryColor: '#FFB800',
    secondaryColor: '#1A1A1A',
    textColor: '#000000',
    swiftCode: 'BCEYLKLX',
    defaultBranch: 'Corporate Branch Colombo',
  },
  {
    key: 'ntb',
    name: 'Nations Trust Bank (NTB)',
    shortName: 'NTB',
    primaryColor: '#002B49',
    secondaryColor: '#00A3E0',
    textColor: '#FFFFFF',
    swiftCode: 'NTBLLKLX',
    defaultBranch: 'Dharmapala Mawatha Branch',
  },
  {
    key: 'seylan',
    name: 'Seylan Bank PLC',
    shortName: 'Seylan',
    primaryColor: '#0B3082',
    secondaryColor: '#DA291C',
    textColor: '#FFFFFF',
    swiftCode: 'SEYBLKLX',
    defaultBranch: 'Kollupitiya Branch',
  },
  {
    key: 'peoples',
    name: "People's Bank",
    shortName: "People's",
    primaryColor: '#800020',
    secondaryColor: '#F2A900',
    textColor: '#FFFFFF',
    swiftCode: 'PSBLLKLX',
    defaultBranch: 'Colombo 07 Branch',
  },
  {
    key: 'custom',
    name: 'Other Sri Lankan Bank',
    shortName: 'Bank',
    primaryColor: '#701626',
    secondaryColor: '#C5A059',
    textColor: '#FFFFFF',
  },
];

interface BankBadgeProps {
  bankName: string;
  bankLogo?: string;
  logoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BankBadge({
  bankName,
  bankLogo,
  logoUrl,
  className = '',
  size = 'md',
}: BankBadgeProps) {
  const activeLogo = bankLogo || logoUrl;
  // If custom URL uploaded or data URI
  const isCustomImage = activeLogo && (activeLogo.startsWith('http') || activeLogo.startsWith('data:'));

  if (isCustomImage) {
    const imgSizeClasses = {
      sm: 'w-7 h-7',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
    };

    return (
      <div
        className={`rounded-xl overflow-hidden bg-white border border-[#C5A059]/30 flex items-center justify-center p-1 shrink-0 ${imgSizeClasses[size]} ${className}`}
      >
        <img
          src={activeLogo}
          alt={bankName}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // Find matching preset by logo key or bank name search
  const lower = (bankLogo || bankName || '').toLowerCase();
  const matchedPreset = SRI_LANKA_BANKS_PRESETS.find(
    (p) =>
      p.key === lower ||
      lower.includes(p.key) ||
      bankName.toLowerCase().includes(p.shortName.toLowerCase()) ||
      bankName.toLowerCase().includes(p.name.toLowerCase())
  ) || SRI_LANKA_BANKS_PRESETS[SRI_LANKA_BANKS_PRESETS.length - 1];

  const sizeClasses = {
    sm: 'w-7 h-7 text-[9px] rounded-lg',
    md: 'w-10 h-10 text-[11px] rounded-xl',
    lg: 'w-14 h-14 text-sm rounded-2xl',
  };

  return (
    <div
      className={`shrink-0 flex flex-col items-center justify-center font-bold tracking-tight shadow-xs border transition-transform ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: matchedPreset.primaryColor,
        color: matchedPreset.textColor,
        borderColor: matchedPreset.secondaryColor,
      }}
      title={bankName}
    >
      <span className="leading-none select-none font-display font-black">
        {matchedPreset.shortName}
      </span>
      {size !== 'sm' && (
        <span
          className="text-[7.5px] uppercase tracking-widest leading-none pt-0.5 opacity-80"
          style={{ color: matchedPreset.secondaryColor }}
        >
          LK
        </span>
      )}
    </div>
  );
}
