import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

// Modelos WatermelonDB (requiere experimentalDecorators en tsconfig).
// Nombres *_Model para no sombrear el global Event.
// Registrados los 5: events, guests, providers, budget_items, timeline_nodes.

export class EventModel extends Model {
  static table = 'events';
  @field('name') name!: string;
  @field('mode') mode!: string;
  @field('guest_count') guestCount!: number;
  @readonly @date('updated_at') updatedAt!: Date;
}

export class GuestModel extends Model {
  static table = 'guests';
  @field('event_id') eventId!: string;
  @field('full_name') fullName!: string;
  @field('rsvp_status') rsvp!: string;
  @field('dietary') dietary?: string;
  @field('table_id') tableId?: string;
  @field('last_write_at') lastWriteAt!: number;
}

export class ProviderModel extends Model {
  static table = 'providers';
  @field('event_id') eventId!: string;
  @field('category') category!: string;
  @field('name') name!: string;
  @field('status') status!: string;
  @field('qr_token') qrToken!: string;
}

export class BudgetItemModel extends Model {
  static table = 'budget_items';
  @field('event_id') eventId!: string;
  @field('concept') concept!: string;
  @field('amount') amount!: number;
  @field('tax_rate') taxRate!: number;
}

export class TimelineNodeModel extends Model {
  static table = 'timeline_nodes';
  @field('event_id') eventId!: string;
  @field('provider_id') providerId?: string;
  @field('title') title!: string;
  @field('starts_at') startsAt!: number;
  @field('ends_at') endsAt!: number;
  @field('sort_order') sortOrder!: number;
}
