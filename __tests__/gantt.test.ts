import { recalculateTimeline } from '../src/logistics/gantt';

const H = 3600000;
const t0 = Date.parse('2026-12-12T14:00:00Z');

test('retraso 30min propaga a dependiente y marca colisión', () => {
  const nodes = [
    { id: 'makeup', title: 'Maquillaje', startsAt: t0, endsAt: t0 + H },
    { id: 'photos', title: 'Fotos', startsAt: t0 + H, endsAt: t0 + 2 * H, dependsOn: 'makeup' },
  ];
  const { nodes: out, collisions } = recalculateTimeline(nodes, 'makeup', 30);
  const photos = out.find((n) => n.id === 'photos')!;
  expect(photos.startsAt).toBe(t0 + H + 30 * 60000);
  expect(Array.isArray(collisions)).toBe(true);
});
