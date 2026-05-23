import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {

  if (req.method === 'GET') {

    const letters = await sql`
      SELECT * FROM letters
      ORDER BY created_at DESC
    `;

    return res.status(200).json(letters);
  }

  if (req.method === 'POST') {

    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: 'Faltan datos'
      });
    }

    const result = await sql`
      INSERT INTO letters (title, content)
      VALUES (${title}, ${content})
      RETURNING *
    `;

    return res.status(200).json(result[0]);
  }

  return res.status(405).json({
    error: 'Método no permitido'
  });
}