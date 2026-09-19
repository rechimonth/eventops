export interface TableDef { id: string; shape: 'round' | 'rect'; seats: number; x: number; y: number }
export const DEFAULT_TABLES: TableDef[] = [
  { id: 'M1', shape: 'round', seats: 8, x: 40, y: 40 },
  { id: 'M2', shape: 'rect', seats: 10, x: 220, y: 40 },
  { id: 'M3', shape: 'round', seats: 8, x: 40, y: 220 },
];
// Misma data para Fabric.js (web/desktop WebView) y nativo: { guestId, tableId }.
// Tauri/Electron reutilizan este módulo sin cambios (lógica agnóstica).
