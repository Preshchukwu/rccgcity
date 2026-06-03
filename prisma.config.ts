import { config } from 'dotenv'
import { defineConfig } from 'prisma/config'

// Load .env.local so DATABASE_URL is available when running Prisma CLI commands.
// Next.js loads .env.local automatically at runtime; this covers CLI usage.
config({ path: '.env.local' })
config({ path: '.env' }) // fallback when .env.local does not exist

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
