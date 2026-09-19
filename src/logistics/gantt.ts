// Logistics Engine: recálculo Gantt con colisiones.
// Si Maquillaje se retrasa 30min, propaga a nodos dependientes.

export interface TNode { id: string; title: string; startsAt: number; endsAt: number; dependsOn?: string }

export interface Collision { nodeId: string; overlapMin: number; withId: string }

export function recalculateTimeline(nodes: TNode[], delayedId: string, delayMin: number) {
  const byId = new Map(nodes.map((n) => [n.id, { ...n }]));
  const delayed = byId.get(delayedId);
  if (!delayed) return { nodes, collisions: [] as Collision[] };
  delayed.endsAt += delayMin * 60000;

  // Propagación simple: todo nodo que dependa (transitiva) se empuja.
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of byId.values()) {
      if (!n.dependsOn) continue;
      const dep = byId.get(n.dependsOn)!;
      if (!dep) continue;
      if (n.startsAt < dep.endsAt) {
        const shift = dep.endsAt - n.startsAt;
        n.startsAt += shift;
        n.endsAt += shift;
        changed = true;
      }
    }
  }

  // Colisiones: solapamiento temporal entre nodos ordenados (recurso único, ej. salón).
  const sorted = [...byId.values()].sort((a, b) => a.startsAt - b.startsAt);
  const collisions: Collision[] = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startsAt < sorted[i - 1].endsAt) {
      collisions.push({
        nodeId: sorted[i].id,
        withId: sorted[i - 1].id,
        overlapMin: Math.round((sorted[i - 1].endsAt - sorted[i].startsAt) / 60000),
      });
    }
  }
  return { nodes: [...byId.values()], collisions };
}
