import { neon } from '@neondatabase/serverless';

let tablesReady = false;

export function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing');
  }

  return neon(process.env.DATABASE_URL);
}

export async function ensureTables(sql = getSql()) {
  if (tablesReady) {
    return sql;
  }

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(120) UNIQUE NOT NULL,
      phone VARCHAR(30) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'passenger',
      car_model VARCHAR(100),
      car_number VARCHAR(40),
      rating NUMERIC(3, 2) NOT NULL DEFAULT 4.90,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS rides (
      id SERIAL PRIMARY KEY,
      passenger_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_type VARCHAR(30) NOT NULL DEFAULT 'jol_x',
      pickup_label TEXT NOT NULL,
      pickup_lat DOUBLE PRECISION NOT NULL,
      pickup_lng DOUBLE PRECISION NOT NULL,
      destination_label TEXT NOT NULL,
      destination_lat DOUBLE PRECISION NOT NULL,
      destination_lng DOUBLE PRECISION NOT NULL,
      route_distance_km NUMERIC(8, 2) NOT NULL,
      route_duration_min INTEGER NOT NULL,
      base_price INTEGER NOT NULL,
      recommended_price INTEGER NOT NULL,
      demand_multiplier NUMERIC(5, 2) NOT NULL,
      traffic_multiplier NUMERIC(5, 2) NOT NULL,
      weather_multiplier NUMERIC(5, 2) NOT NULL,
      ai_reasoning TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'confirmed',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(20) NOT NULL,
      channel VARCHAR(30) NOT NULL DEFAULT 'support',
      text TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;

  tablesReady = true;
  return sql;
}
