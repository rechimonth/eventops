// Shadow Budgeting: +20% imprevistos + impuestos reales (ej. IVA AR 21%).

export const SHADOW_RATE = 0.2;

export function quoteWithShadow(amount: number, taxRate = 21) {
  const tax = (amount * taxRate) / 100;
  const shadow = amount * SHADOW_RATE;
  return { base: amount, tax, shadow, total: amount + tax + shadow };
}

export function sumBudget(items: { amount: number; taxRate?: number }[]) {
  return items.reduce(
    (acc, it) => {
      const q = quoteWithShadow(it.amount, it.taxRate ?? 21);
      return {
        base: acc.base + q.base,
        tax: acc.tax + q.tax,
        shadow: acc.shadow + q.shadow,
        total: acc.total + q.total,
      };
    },
    { base: 0, tax: 0, shadow: 0, total: 0 }
  );
}
