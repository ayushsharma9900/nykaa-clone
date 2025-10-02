// Re-export from database-config for backward compatibility and enhanced functionality
export {
  runQuery,
  getAllQuery,
  getQuery,
  ensureDatabaseInitialized,
  generateId,
  generateSKU
} from './database-config';

import { runQuery, getAllQuery, ensureDatabaseInitialized } from './database-config';

// For backward compatibility - alias the new function name
export const initializeDatabase = ensureDatabaseInitialized;

// Compatible pool interface for existing code
export const pool = {
  execute: async (query: string, params: any[] = []) => {
    if (query.toLowerCase().includes('select')) {
      const rows = await getAllQuery(query, params);
      return [rows];
    } else {
      const result = await runQuery(query, params);
      return [result];
    }
  },
  getConnection: async () => {
    return {
      execute: pool.execute,
      release: () => {},
      config: {
        host: 'database',
        port: 'mixed',
        database: 'kayaalife'
      }
    };
  }
};
