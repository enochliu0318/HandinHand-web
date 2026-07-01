#!/bin/sh
set -e

echo "Waiting for database..."
until node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT 1')
  .then(() => { pool.end(); process.exit(0); })
  .catch(() => process.exit(1));
" 2>/dev/null; do
  sleep 2
done

echo "Running migrations..."
npm run db:deploy

if [ "$RUN_SEED" = "true" ]; then
  echo "Seeding database..."
  npm run db:seed
fi

echo "Starting application..."
exec npm start
