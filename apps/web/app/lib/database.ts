import { createManagerInstance } from '@activityrank/database';

export const manager = createManagerInstance({
  host: import.meta.env.VITE_DB_HOST,
  user: import.meta.env.VITE_DB_USER,
  password: import.meta.env.VITE_DB_PASS,
  database: import.meta.env.VITE_DB_NAME,
  connectionLimit: 3,
});
