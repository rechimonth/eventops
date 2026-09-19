import { appSchema, tableSchema } from '@nozbe/watermelondb';

// WatermelonDB: caché offline. Tablas espejo de Supabase.
export const schema = appSchema({
  version: 3,
  tables: [
    tableSchema({ name: 'events', columns: [
      { name: 'name', type: 'string' },
      { name: 'event_date', type: 'number' },
      { name: 'venue', type: 'string', isOptional: true },
      { name: 'mode', type: 'string' },
      { name: 'guest_count', type: 'number' },
      { name: 'updated_at', type: 'number' },
    ]}),
    tableSchema({ name: 'guests', columns: [
      { name: 'event_id', type: 'string', isIndexed: true },
      { name: 'full_name', type: 'string' },
      { name: 'phone', type: 'string', isOptional: true },
      { name: 'rsvp_status', type: 'string' },
      { name: 'dietary', type: 'string', isOptional: true },
      { name: 'table_id', type: 'string', isOptional: true },
      { name: 'last_write_at', type: 'number' },
      { name: 'last_writer', type: 'string', isOptional: true },
    ]}),
    tableSchema({ name: 'providers', columns: [
      { name: 'event_id', type: 'string', isIndexed: true },
      { name: 'category', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'status', type: 'string' },
      { name: 'scheduled_at', type: 'number', isOptional: true },
      { name: 'duration_min', type: 'number' },
      { name: 'depends_on', type: 'string', isOptional: true },
      { name: 'qr_token', type: 'string' },
    ]}),
    tableSchema({ name: 'budget_items', columns: [
      { name: 'event_id', type: 'string', isIndexed: true },
      { name: 'concept', type: 'string' },
      { name: 'amount', type: 'number' },
      { name: 'tax_rate', type: 'number' },
    ]}),
    tableSchema({ name: 'timeline_nodes', columns: [
      { name: 'event_id', type: 'string', isIndexed: true },
      { name: 'provider_id', type: 'string', isOptional: true },
      { name: 'title', type: 'string' },
      { name: 'starts_at', type: 'number' },
      { name: 'ends_at', type: 'number' },
      { name: 'sort_order', type: 'number' },
    ]}),
  ],
});
