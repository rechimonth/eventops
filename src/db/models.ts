import { Model } from '@nozbe/watermelondb';
import { field, date, readonly } from '@nozbe/watermelondb/decorators';

export class Event extends Model {
  static table = 'events';
  // @ts-ignore
  @field('name') name!: string;
  // @ts-ignore
  @field('mode') mode!: string;
  // @ts-ignore
  @field('guest_count') guestCount!: number;
  // @ts-ignore
  @readonly @date('updated_at') updatedAt!: Date;
}
export class Guest extends Model {
  static table = 'guests';
  // @ts-ignore
  @field('event_id') eventId!: string;
  // @ts-ignore
  @field('full_name') fullName!: string;
  // @ts-ignore
  @field('rsvp_status') rsvp!: string;
  // @ts-ignore
  @field('table_id') tableId?: string;
  // @ts-ignore
  @field('last_write_at') lastWriteAt!: number;
}
export class Provider extends Model {
  static table = 'providers';
  // @ts-ignore
  @field('event_id') eventId!: string;
  // @ts-ignore
  @field('category') category!: string;
  // @ts-ignore
  @field('name') name!: string;
  // @ts-ignore
  @field('status') status!: string;
  // @ts-ignore
  @field('qr_token') qrToken!: string;
}
