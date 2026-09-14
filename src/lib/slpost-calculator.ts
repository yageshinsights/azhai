/**
 * Sri Lanka Post (Department of Posts, Sri Lanka)
 * Official Speed Post Courier & Cash On Delivery (COD) Calculation Engine
 * 
 * Sources:
 * - SL-Post-COD-English-New.pdf (SL Post Cash On Delivery Regulations & Tariff)
 * - https://slpost.gov.lk/services/speed-post-courier-tracking/
 */

export interface SLPostRateTier {
  minWeight: number; // in grams
  maxWeight: number; // in grams
  chargeLKR: number;
}

export const SL_POST_COURIER_TIERS: SLPostRateTier[] = [
  { minWeight: 0, maxWeight: 250, chargeLKR: 200 },
  { minWeight: 250, maxWeight: 500, chargeLKR: 250 },
  { minWeight: 500, maxWeight: 1000, chargeLKR: 350 },
  { minWeight: 1000, maxWeight: 2000, chargeLKR: 400 },
  { minWeight: 2000, maxWeight: 3000, chargeLKR: 450 },
  { minWeight: 3000, maxWeight: 4000, chargeLKR: 500 },
  { minWeight: 4000, maxWeight: 5000, chargeLKR: 550 },
  { minWeight: 5000, maxWeight: 6000, chargeLKR: 600 },
  { minWeight: 6000, maxWeight: 7000, chargeLKR: 650 },
  { minWeight: 7000, maxWeight: 8000, chargeLKR: 700 },
  { minWeight: 8000, maxWeight: 9000, chargeLKR: 750 },
  { minWeight: 9000, maxWeight: 10000, chargeLKR: 800 },
  { minWeight: 10000, maxWeight: 15000, chargeLKR: 850 },
  { minWeight: 15000, maxWeight: 20000, chargeLKR: 1100 },
  { minWeight: 20000, maxWeight: 25000, chargeLKR: 1600 },
  { minWeight: 25000, maxWeight: 30000, chargeLKR: 2100 },
  { minWeight: 30000, maxWeight: 35000, chargeLKR: 2600 },
  { minWeight: 35000, maxWeight: 40000, chargeLKR: 3100 },
];

export const SL_POST_MAX_WEIGHT_GRAMS = 40000; // 40 kg
export const SL_POST_MAX_COD_VALUE_LKR = 100000; // Rs. 100,000.00
export const SL_POST_COD_SERVICE_CHARGE_LKR = 50; // Fixed Rs. 50.00
export const PACKAGING_ALLOWANCE_GRAMS = 150; // Keepsake box + bubble wrap + postage bag

/**
 * Calculates the standard weight-based postage fee for SL Post Courier
 */
export function calculateSLPostPostage(weightGrams: number): {
  fee: number;
  tier?: SLPostRateTier;
  error?: string;
} {
  const safeWeight = Math.max(1, Math.round(weightGrams));

  if (safeWeight > SL_POST_MAX_WEIGHT_GRAMS) {
    return {
      fee: 3100,
      error: `Parcel weight (${(safeWeight / 1000).toFixed(1)}kg) exceeds Sri Lanka Post maximum limit of 40kg.`,
    };
  }

  const tier = SL_POST_COURIER_TIERS.find(
    (t) => safeWeight > t.minWeight && safeWeight <= t.maxWeight
  ) || SL_POST_COURIER_TIERS[SL_POST_COURIER_TIERS.length - 1];

  return {
    fee: tier.chargeLKR,
    tier,
  };
}

/**
 * Calculates the SL Post Money Order Commission based on parcel declared value
 */
export function calculateSLPostMoneyOrderCommission(declaredValueLKR: number): {
  commission: number;
  error?: string;
} {
  const val = Math.max(0, declaredValueLKR);

  if (val > SL_POST_MAX_COD_VALUE_LKR) {
    return {
      commission: 0,
      error: `Order value (LKR ${val.toLocaleString()}) exceeds the maximum Sri Lanka Post COD limit of LKR 100,000.`,
    };
  }

  if (val <= 0) {
    return { commission: 0 };
  }

  if (val <= 2000) {
    // Rs. 2 for every Rs. 100 or part thereof (max 40 at 2,000)
    return { commission: Math.ceil(val / 100) * 2 };
  }

  if (val <= 10000) {
    // Base 40 + Rs. 10 for every Rs. 2,000 increment above 2,000
    const excess = val - 2000;
    const steps = Math.ceil(excess / 2000);
    return { commission: 40 + steps * 10 };
  }

  if (val <= 50000) {
    // Base 80 + Rs. 50 for every Rs. 40,000 increment above 10,000
    const excess = val - 10000;
    const steps = Math.ceil(excess / 40000);
    return { commission: 80 + steps * 50 };
  }

  // Rs. 50,001 to Rs. 100,000
  // Base 130 + Rs. 100 for every Rs. 50,000 increment above 50,000
  const excess = val - 50000;
  const steps = Math.ceil(excess / 50000);
  return { commission: 130 + steps * 100 };
}

export interface SLPostShippingResult {
  postageFee: number;
  moneyOrderCommission: number;
  serviceCharge: number;
  totalShippingFee: number;
  isCOD: boolean;
  totalWeightGrams: number;
  orderValueLKR: number;
  netSellerRemittance: number;
  deliveryTimeline: string;
  error?: string;
}

/**
 * Main Shipping Calculation for Azhai:
 * - If isCOD === false: returns weight-based postage
 * - If isCOD === true: returns Postage + Money Order Commission + Fixed Service Charge (Rs. 50)
 */
export function calculateSLPostShipping({
  weightGrams,
  orderValueLKR,
  isCOD,
  isWithinZone = false,
}: {
  weightGrams: number;
  orderValueLKR: number;
  isCOD: boolean;
  isWithinZone?: boolean;
}): SLPostShippingResult {
  const safeWeight = Math.max(100, Math.round(weightGrams));
  const postageRes = calculateSLPostPostage(safeWeight);

  let commission = 0;
  let serviceCharge = 0;
  let error = postageRes.error;

  if (isCOD) {
    const moRes = calculateSLPostMoneyOrderCommission(orderValueLKR);
    commission = moRes.commission;
    serviceCharge = SL_POST_COD_SERVICE_CHARGE_LKR;
    if (moRes.error) {
      error = moRes.error;
    }
  }

  const totalShippingFee = isCOD
    ? postageRes.fee + commission + serviceCharge
    : postageRes.fee;

  return {
    postageFee: postageRes.fee,
    moneyOrderCommission: commission,
    serviceCharge,
    totalShippingFee,
    isCOD,
    totalWeightGrams: safeWeight,
    orderValueLKR,
    netSellerRemittance: Math.max(0, orderValueLKR - (commission + serviceCharge)),
    deliveryTimeline: isWithinZone
      ? '24 Hours (Own Delivery Zone / Western Province)'
      : '48 Hours (Island-wide 25 Districts)',
    error,
  };
}

/**
 * Garment Weight Estimator for Azhai Atelier Pieces
 */
export function estimateGarmentWeight(item: {
  weightGrams?: number;
  category?: string;
  name?: string;
}): number {
  if (typeof item.weightGrams === 'number' && item.weightGrams > 0) {
    return item.weightGrams;
  }

  const name = (item.name || '').toLowerCase();
  const cat = (item.category || '').toLowerCase();

  if (name.includes('lehenga') || cat.includes('lehenga') || name.includes('bridal')) {
    return 2200; // Heavy hand-embroidered lehenga ~2.2kg
  }
  if (name.includes('saree') || cat.includes('saree') || name.includes('kanjivaram')) {
    return 850; // Silk saree with blouse piece ~850g
  }
  if (name.includes('kurti') || cat.includes('kurti') || name.includes('suit') || name.includes('set')) {
    return 450; // Kurti set with pants / dupatta ~450g
  }
  if (name.includes('blouse') || cat.includes('blouse') || name.includes('corset') || name.includes('top')) {
    return 250; // Tailored blouse or corset ~250g
  }
  if (name.includes('shawl') || cat.includes('shawl') || name.includes('dupatta')) {
    return 280; // Festive sheer organza / silk shawl ~280g
  }

  return 400;
}

/**
 * Calculates cumulative cart weight including packaging
 */
export function estimateCartWeight(items: Array<{
  quantity: number;
  weightGrams?: number;
  name?: string;
  category?: string;
}>): number {
  if (!items || items.length === 0) return PACKAGING_ALLOWANCE_GRAMS;

  const itemsWeight = items.reduce((sum, item) => {
    const singleWeight = estimateGarmentWeight(item);
    return sum + singleWeight * Math.max(1, item.quantity || 1);
  }, 0);

  return itemsWeight + PACKAGING_ALLOWANCE_GRAMS;
}

/**
 * Generates an official-standard 13-character tracking number (BA123456789LK)
 */
export function generateSLPostTrackingNumber(): string {
  const random9Digits = Math.floor(100000000 + Math.random() * 900000000);
  return `BA${random9Digits}LK`;
}

/**
 * Generates direct tracking link
 */
export function getSLPostTrackingUrl(trackingNumber?: string): string {
  if (!trackingNumber) return 'http://www.slpmail.slpost.gov.lk/track/';
  return `http://www.slpmail.slpost.gov.lk/track/?ref=${encodeURIComponent(trackingNumber)}`;
}
