import { neon } from '@neondatabase/serverless'; // ИСПРАВЛЕНО

export default async function handler(request, context) {
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });

    try {
        const { email, password } = await request.json();
        const sql = neon(process.env.DATABASE_URL);

        const result = await sql`
            SELECT id, name, email, iin, role, car_model, car_number, rating 
            FROM users 
            WHERE email = ${email} AND password = ${password}
        `;

        if (result.length > 0) {
            return new Response(JSON.stringify({ user: result[0] }), { status: 200 });
        } else {
            return new Response(JSON.stringify({ error: "Неверный логин или пароль" }), { status: 401 });
        }
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}