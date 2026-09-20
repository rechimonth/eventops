import { quoteWithShadow, sumBudget } from '../src/logistics/budget';

test('shadow +20% + IVA', () => {
  const q = quoteWithShadow(1000, 21);
  expect(q.tax).toBe(210);
  expect(q.shadow).toBe(200);
  expect(q.total).toBe(1410);
});

test('centavos exactos: 0.1 no deja float espurio', () => {
  expect(quoteWithShadow(0.1, 21).total).toBe(0.14);
});

test('monto negativo rechaza', () => {
  expect(() => quoteWithShadow(-5)).toThrow(RangeError);
});

test('sumBudget acumula', () => {
  const t = sumBudget([{ amount: 1000 }, { amount: 500, taxRate: 10.5 }]);
  expect(t.base).toBe(1500);
  expect(t.total).toBe(1410 + 500 + 52.5 + 100);
});
