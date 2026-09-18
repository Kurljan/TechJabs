import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL;
  if (url && url.includes('-pooler') && !url.includes('pgbouncer=true')) {
    url += url.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
  }

  return new PrismaClient(url ? { datasources: { db: { url } } } : undefined)
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
