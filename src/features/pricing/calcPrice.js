// Bảng giá theo trọng tải (VND/km)
// 0.5-1 tấn 40k; 1-3 tấn 60k; 3-5 tấn 80k; 5-10 tấn 100k
const TIERS = [
   { minTon: 0.5, maxTon: 1, pricePerKm: 40000 },
   { minTon: 1, maxTon: 3, pricePerKm: 60000 },
   { minTon: 3, maxTon: 5, pricePerKm: 80000 },
   { minTon: 5, maxTon: 10, pricePerKm: 100000 },
];

export function findPricePerKmByWeightKg(weightKg) {
   const ton = weightKg / 1000;
   const tier = TIERS.find((t) => ton >= t.minTon && ton <= t.maxTon);
   return tier ? tier.pricePerKm : TIERS[TIERS.length - 1].pricePerKm;
}

// item: { weightKg, distanceKm, loadingAssist?: boolean, insurance?: number }
export function calcItemPrice(item) {
   const pricePerKm = findPricePerKmByWeightKg(item.weightKg || 0);
   const base = (item.distanceKm || 0) * pricePerKm;
   const loadingFee = item.loadingAssist ? 50000 : 0; // phụ phí bốc hàng mặc định 50k
   const insurance = typeof item.insurance === "number" ? item.insurance : 0; // 100k-200k tùy item
   return base + loadingFee + insurance;
}

export function calcOrderTotal(items = []) {
   return items.reduce((sum, it) => sum + calcItemPrice(it), 0);
}


