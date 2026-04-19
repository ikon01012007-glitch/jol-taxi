import { neon } from '@netlify/neon';

export default async function handler(request, context) {
    const sql = neon(process.env.DATABASE_URL);

    try {
        // 1. Таблица пользователей (универсальная)
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                iin VARCHAR(12) UNIQUE,
                role VARCHAR(20) DEFAULT 'passenger', -- 'passenger', 'driver', 'admin'
                car_model VARCHAR(100), -- Только для водителей
                car_number VARCHAR(20),  -- Только для водителей
                rating NUMERIC(3,1) DEFAULT 5.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // 2. Таблица поездок (вместо анализов и приемов)
        await sql`
            CREATE TABLE IF NOT EXISTS rides (
                id SERIAL PRIMARY KEY,
                passenger_iin VARCHAR(12) NOT NULL,
                driver_iin VARCHAR(12),
                pickup_address TEXT NOT NULL,
                destination_address TEXT NOT NULL,
                price INTEGER,
                status VARCHAR(20) DEFAULT 'searching', -- 'searching', 'accepted', 'completed', 'cancelled'
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Создаем тестового водителя для Астаны
        await sql`
            INSERT INTO users (name, email, password, iin, role, car_model, car_number)
            VALUES ('Алексей Водитель', 'driver@jol.kz', 'Driver123', '111222333444', 'driver', 'Toyota Camry', '010 AAA 01')
            ON CONFLICT (email) DO NOTHING
        `;

        return new Response(JSON.stringify({ message: "✅ База Jol Taxi успешно инициализирована!" }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}