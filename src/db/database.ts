import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from './watermelonSchema';
import { Event, Guest, Provider } from './models';

const adapter = new LokiJSAdapter({ schema, useWebWorker: false, useIncrementalIndexedDB: false });

export const database = new Database({
  adapter,
  modelClasses: [Event as any, Guest as any, Provider as any],
});
