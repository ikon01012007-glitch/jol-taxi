import { neon } from '@netlify/neon';

export default async function handler(request, context) {
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });

    try {
        const data = await request.json();
        const { name, email, password, iin, role, car_model, car_number } = data;
        const sql = neon(process.env.DATABASE_URL);

        const result = await sql`
            INSERT INTO users (name, email, password, iin, role, car_model, car_number)
            VALUES (${name}, ${email}, ${password}, ${iin}, ${role || 'passenger'}, ${car_model || null}, ${car_number || null})
            RETURNING id, name, email, role;
        `;

        return new Response(JSON.stringify({ message: "✅ Регистрация в Jol Taxi успешна!", user: result[0] }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: "Ошибка регистрации. Возможно, такой email или ИИН уже есть." }), { status: 500 });
    }
}