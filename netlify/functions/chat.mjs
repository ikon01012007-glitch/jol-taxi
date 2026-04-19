import { neon } from '@neondatabase/serverless'; //

export default async function handler(request, context) {
    if (request.method !== 'POST') return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });

    const sql = neon(process.env.DATABASE_URL); //

    try {
        const data = await request.json();
        const { action, sender, receiver, text } = data;

        if (action === 'send') {
            await sql`INSERT INTO chat_messages (sender, receiver, text) VALUES (${sender}, ${receiver}, ${text})`;

            let replyText = "";
            if (receiver === 'support') {
                const apiKey = process.env.GEMINI_API_KEY; // 
                
                // Имитация данных о пробках (в реальном приложении здесь будет запрос к Maps API)
                const currentHour = new Date().getHours();
                const trafficJams = (currentHour >= 8 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 19) ? 9 : 3;
                const demandCoeff = trafficJams > 7 ? 1.5 : 1.0; // Повышенный спрос в пробки

                const systemPrompt = `
                    Ты — диспетчер такси "Jol AI" в Астане. Твоя задача — рассчитать стоимость поездки.
                    Текущая ситуация на дорогах: ${trafficJams}/10 баллов.
                    Коэффициент спроса: x${demandCoeff}.
                    Базовый тариф: 500 тенге + 150 тенге за км.

                    Если пользователь пишет маршрут:
                    1. Оцени примерное расстояние (используй свои знания карты Астаны).
                    2. Рассчитай цену: (500 + (расстояние * 150)) * ${demandCoeff}.
                    3. Распиши пользователю, почему такая цена: "Базовый тариф + пробки ${trafficJams} баллов".
                    
                    Отвечай кратко и профессионально.
                `;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: systemPrompt + "\nСообщение пользователя: " + text }] }]
                    })
                });

                const aiData = await response.json();
                replyText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Ошибка связи с диспетчером.";
                
                await sql`INSERT INTO chat_messages (sender, receiver, text) VALUES ('support', ${sender}, ${replyText})`;
            }

            return new Response(JSON.stringify({ message: "Отправлено", reply: replyText }), { status: 200 });
        }
        // ... (остальной код загрузки истории)
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}