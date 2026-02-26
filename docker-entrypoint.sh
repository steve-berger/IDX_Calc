#!/bin/sh
set -e

FIRST_RUN=false
if [ ! -f /data/app.db ]; then
  FIRST_RUN=true
fi

echo "==> Running database migrations..."
npx prisma migrate deploy

if [ "$FIRST_RUN" = true ]; then
  echo "==> First run detected — seeding database with sample data..."
  npx tsx prisma/seed.mts

  echo "==> Syncing VPI index data from Statistik Austria..."
  npx tsx scripts/sync-vpi-data.mts || echo "    Warning: VPI sync failed (needs internet). You can retry later."
fi

echo "==> Starting application on port ${PORT:-3000}..."
exec node server.js
