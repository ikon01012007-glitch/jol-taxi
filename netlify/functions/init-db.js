import { neon } from '@neondatabase/serverless'; // ИСПРАВЛЕНО

export default async function handler(request, context) {
    // Явно берем ссылку из переменных окружения
    const sql = neon(process.env.DATABASE_URL);

    try {
        // Создаем таблицу пользователей
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(100) NOT NULL,
                iin VARCHAR(12) UNIQUE,
                role VARCHAR(20) DEFAULT 'passenger',
                car_model VARCHAR(100),
                car_number VARCHAR(20),
                rating NUMERIC(3,1) DEFAULT 5.0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Создаем таблицу поездок
        await sql`
            CREATE TABLE IF NOT EXISTS rides (
                id SERIAL PRIMARY KEY,
                passenger_iin VARCHAR(12) NOT NULL,
                driver_iin VARCHAR(12),
                pickup_address TEXT NOT NULL,
                destination_address TEXT NOT NULL,
                price INTEGER,
                status VARCHAR(20) DEFAULT 'searching',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        return new Response(JSON.stringify({ message: "✅ База Jol Taxi успешно инициализирована!" }), {
            status: 200, headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}