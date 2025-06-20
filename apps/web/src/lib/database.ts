import { createManagerInstance } from '@activityrank/database';

export const manager = createManagerInstance({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 3,
});
