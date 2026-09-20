// Shadow Budgeting: +20% imprevistos + impuestos reales (ej. IVA AR 21%).
// Dinero en centavos enteros: todo se redondea a 2 decimales (0.1 + IVA + shadow = 0.14 exacto).

export const SHADOW_RATE = 0.2;

const cents = (n: number) => Math.round(n * 100) / 100;

export function quoteWithShadow(amount: number, taxRate = 21) {
  if (!Number.isFinite(amount) || amount < 0) throw new RangeError('monto inválido');
  if (!Number.isFinite(taxRate) || taxRate < 0) throw new RangeError('IVA inválido');
  const tax = cents((amount * taxRate) / 100);
  const shadow = cents(amount * SHADOW_RATE);
  return { base: cents(amount), tax, shadow, total: cents(cents(amount) + tax + shadow) };
}

export function sumBudget(items: { amount: number; taxRate?: number }[]) {
  const acc = items.reduce(
    (a, it) => {
      const q = quoteWithShadow(it.amount, it.taxRate ?? 21);
      return { base: a.base + q.base, tax: a.tax + q.tax, shadow: a.shadow + q.shadow, total: a.total + q.total };
    },
    { base: 0, tax: 0, shadow: 0, total: 0 }
  );
  return { base: cents(acc.base), tax: cents(acc.tax), shadow: cents(acc.shadow), total: cents(acc.total) };
}
