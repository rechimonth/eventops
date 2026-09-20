import { recalculateTimeline } from '../src/logistics/gantt';

const H = 3600000;
const t0 = Date.parse('2026-12-12T14:00:00Z');

test('retraso 30min propaga a dependiente sin colisión', () => {
  const nodes = [
    { id: 'makeup', title: 'Maquillaje', startsAt: t0, endsAt: t0 + H },
    { id: 'photos', title: 'Fotos', startsAt: t0 + H, endsAt: t0 + 2 * H, dependsOn: 'makeup' },
  ];
  const { nodes: out, collisions, cycle } = recalculateTimeline(nodes, 'makeup', 30);
  const photos = out.find((n) => n.id === 'photos')!;
  expect(photos.startsAt).toBe(t0 + H + 30 * 60000);
  expect(collisions).toEqual([]);
  expect(cycle).toBeNull();
});

test('nodo largo colisiona con posteriores no adyacentes', () => {
  const nodes = [
    { id: 'salon', title: 'Salón', startsAt: t0, endsAt: t0 + 8 * H },
    { id: 'a', title: 'A', startsAt: t0 + H, endsAt: t0 + 2 * H },
    { id: 'b', title: 'B', startsAt: t0 + 3 * H, endsAt: t0 + 4 * H },
  ];
  const { collisions } = recalculateTimeline(nodes, 'a', 0);
  const pairs = collisions.map((c) => [c.nodeId, c.withId].sort().join('+')).sort();
  expect(pairs).toEqual(['a+salon', 'b+salon']);
});

test('ciclo A<->B no cuelga y se reporta', () => {
  const nodes = [
    { id: 'a', title: 'A', startsAt: t0, endsAt: t0 + H, dependsOn: 'b' },
    { id: 'b', title: 'B', startsAt: t0, endsAt: t0 + H, dependsOn: 'a' },
  ];
  const { cycle, collisions } = recalculateTimeline(nodes, 'a', 30);
  expect(cycle).not.toBeNull();
  expect(collisions).toEqual([]);
});

test('autodependencia no cuelga y se reporta', () => {
  const nodes = [{ id: 'a', title: 'A', startsAt: t0, endsAt: t0 + H, dependsOn: 'a' }];
  const { cycle } = recalculateTimeline(nodes, 'a', 30);
  expect(cycle).toEqual(['a', 'a']);
});
