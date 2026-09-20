import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';
import { schema } from './watermelonSchema';
import { EventModel, GuestModel, ProviderModel, BudgetItemModel, TimelineNodeModel } from './models';

// LokiJS en React Native es MEMORIA VOLÁTIL (sin indexedDB): los datos
// mueren al cerrar la app. Sirve para Expo Go / demo.
// En dev-client o prebuild nativo, EXPO_PUBLIC_USE_SQLITE=true activa
// SQLite persistente (requiere el config plugin de WatermelonDB + prebuild).
function buildDatabase(): Database {
  let adapter: any;
  if ((process.env.EXPO_PUBLIC_USE_SQLITE ?? 'false').toLowerCase() === 'true') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const SQLiteAdapter = require('@nozbe/watermelondb/adapters/sqlite').default;
      adapter = new SQLiteAdapter({ dbName: 'eventops', schema, jsi: true });
    } catch (e) {
      console.warn('[db] SQLite no disponible, fallback a LokiJS (volátil)', e);
    }
  }
  adapter ??= new LokiJSAdapter({ schema, useWebWorker: false, useIncrementalIndexedDB: false });
  return new Database({
    adapter,
    modelClasses: [EventModel, GuestModel, ProviderModel, BudgetItemModel, TimelineNodeModel],
  });
}

export const database = buildDatabase();
