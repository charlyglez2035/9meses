import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {

    try {

        // OBTENER CARTAS
        if (req.method === "GET") {

            const letters = await sql`
                SELECT *
                FROM letters
                ORDER BY created_at DESC
            `;

            return res.status(200).json(letters);
        }

        // CREAR CARTA
        if (req.method === "POST") {

            const { title, content } = req.body;

            await sql`
                INSERT INTO letters (title, content)
                VALUES (${title}, ${content})
            `;

            return res.status(200).json({
                success: true
            });
        }

        return res.status(405).json({
            error: "Method not allowed"
        });

    } catch (error) {

        return res.status(500).json({
            error: error.message
        });
    }
}