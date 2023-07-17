docker-compose up -d
pnpm dotenv -e .env.test -- pnpm prisma migrate reset --force
pnpm dotenv -e .env.test -- pnpm prisma db push
pnpm test