export function calculerCommission(totalCents: number): number {
  if (totalCents >= 200000) {
    return Math.round(totalCents * 0.035);
  }
  return Math.round(totalCents * 0.05);
}

export function tauxCommission(totalCents: number): string {
  return totalCents >= 200000 ? "3,5%" : "5%";
}
