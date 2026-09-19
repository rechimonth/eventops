import type { TNode } from '../logistics/gantt';

// FASE 8: datos falsos para UI 100% desconectada del backend.
// 15 invitados, 3 proveedores, 1 Gantt básico. Misma forma que Supabase.

export interface MockGuest { id: string; full_name: string; phone: string; rsvp_status: 'pending' | 'confirmed' | 'declined'; dietary?: string; tableId?: string }
export interface MockProvider { id: string; category: string; name: string; status: string; qr_token: string; scheduled_at: number; duration_min: number }

const NAMES: Array<[string, string, 'pending' | 'confirmed' | 'declined', string?]> = [
  ['g01', 'Vincenzo Donato', 'confirmed', undefined],
  ['g02', 'María Fernanda López', 'confirmed', 'celíaca'],
  ['g03', 'Juan Pérez', 'pending', undefined],
  ['g04', 'Ana García', 'confirmed', 'vegetariana'],
  ['g05', 'Carlos Ruiz', 'pending', undefined],
  ['g06', 'Lucía Fernández', 'confirmed', undefined],
  ['g07', 'Diego Torres', 'declined', undefined],
  ['g08', 'Sofía Méndez', 'confirmed', 'vegana'],
  ['g09', 'Martín Aguirre', 'pending', undefined],
  ['g10', 'Camila Sosa', 'confirmed', undefined],
  ['g11', 'Pablo Rivas', 'pending', 'alergia a frutos secos'],
  ['g12', 'Valentina Castro', 'confirmed', undefined],
  ['g13', 'Nicolás Pereyra', 'pending', undefined],
  ['g14', 'Florencia Díaz', 'confirmed', 'kosher'],
  ['g15', 'Andrés Morales', 'pending', undefined],
];

export const MOCK_GUESTS: MockGuest[] = NAMES.map(([id, full_name, rsvp_status, dietary], i) => ({
  id, full_name,
  phone: `+54911${String(5000000 + i * 11111)}`,
  rsvp_status, dietary,
  tableId: i % 3 === 0 ? 'M1' : i % 3 === 1 ? 'M2' : undefined,
}));

const T0 = Date.parse('2026-12-12T14:00:00Z');
const H = 3600000;

export const MOCK_PROVIDERS: MockProvider[] = [
  { id: 'p1', category: 'Maquillaje', name: 'Glam Studio', status: 'confirmed', qr_token: 'QR-GLAM-001', scheduled_at: T0, duration_min: 60 },
  { id: 'p2', category: 'Fotografía', name: 'Foto Luz', status: 'in_transit', qr_token: 'QR-FOTO-002', scheduled_at: T0 + H, duration_min: 120 },
  { id: 'p3', category: 'Catering', name: 'Sabores SA', status: 'pending', qr_token: 'QR-CAT-003', scheduled_at: T0 + 2 * H, duration_min: 180 },
];

export const MOCK_GANTT: TNode[] = [
  { id: 'makeup', title: 'Maquillaje', startsAt: T0, endsAt: T0 + H },
  { id: 'photos', title: 'Sesión fotos', startsAt: T0 + H, endsAt: T0 + 2 * H, dependsOn: 'makeup' },
  { id: 'catering', title: 'Montaje catering', startsAt: T0 + 2 * H, endsAt: T0 + 3 * H, dependsOn: 'photos' },
];

export const MOCK_BUDGET = [
  { concept: 'Salón', amount: 500000, taxRate: 21 },
  { concept: 'Catering x150', amount: 900000, taxRate: 10.5 },
  { concept: 'Fotografía', amount: 180000, taxRate: 21 },
];
