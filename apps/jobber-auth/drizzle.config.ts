import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/app/**/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.AUTH_DATABASE_URL ||
      'postgres://sjadmin:test123@localhost:5432/jobber-auth',
  },
});
