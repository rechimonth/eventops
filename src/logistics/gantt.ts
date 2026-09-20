// Logistics Engine: recálculo Gantt con colisiones.
// Si Maquillaje se retrasa 30min, propaga a nodos dependientes.
// Seguro: detecta ciclos de dependsOn (autodependencia incluida) y nunca cuelga.

export interface TNode { id: string; title: string; startsAt: number; endsAt: number; dependsOn?: string }

export interface Collision { nodeId: string; overlapMin: number; withId: string }

// DFS sobre aristas dependsOn. Devuelve el ciclo o null.
function findCycle(nodes: TNode[]): string[] | null {
  const dep = new Map(nodes.map((n) => [n.id, n.dependsOn]));
  const state = new Map<string, number>(); // 1 = en pila, 2 = listo
  const stack: string[] = [];
  const visit = (id: string): string[] | null => {
    const s = state.get(id) ?? 0;
    if (s === 1) return [...stack.slice(stack.indexOf(id)), id];
    if (s === 2) return null;
    state.set(id, 1);
    stack.push(id);
    const d = dep.get(id);
    if (d && dep.has(d)) {
      const c = visit(d);
      if (c) return c;
    }
    stack.pop();
    state.set(id, 2);
    return null;
  };
  for (const n of nodes) {
    const c = visit(n.id);
    if (c) return c;
  }
  return null;
}

export function recalculateTimeline(nodes: TNode[], delayedId: string, delayMin: number) {
  const cycle = findCycle(nodes);
  if (cycle) return { nodes, collisions: [] as Collision[], cycle };
  const byId = new Map(nodes.map((n) => [n.id, { ...n }]));
  const delayed = byId.get(delayedId);
  if (!delayed) return { nodes, collisions: [] as Collision[], cycle: null as string[] | null };
  delayed.endsAt += delayMin * 60000;

  // Propagación acotada: sin ciclos, N+1 pasadas siempre alcanzan.
  for (let pass = 0; pass < byId.size + 1; pass++) {
    let changed = false;
    for (const n of byId.values()) {
      if (!n.dependsOn) continue;
      const dep = byId.get(n.dependsOn);
      if (!dep) continue;
      if (n.startsAt < dep.endsAt) {
        const shift = dep.endsAt - n.startsAt;
        n.startsAt += shift;
        n.endsAt += shift;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Colisiones por pares (no solo adyacentes): un nodo largo tapa a varios.
  const all = [...byId.values()];
  const collisions: Collision[] = [];
  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      const a = all[i];
      const b = all[j];
      const overlap = Math.min(a.endsAt, b.endsAt) - Math.max(a.startsAt, b.startsAt);
      if (overlap > 0) {
        collisions.push({ nodeId: b.id, withId: a.id, overlapMin: Math.round(overlap / 60000) });
      }
    }
  }
  return { nodes: all, collisions, cycle: null as string[] | null };
}
