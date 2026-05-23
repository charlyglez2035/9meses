import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {

  // GET cartas
  if (req.method === 'GET') {
    try {
      const letters = await sql`
        SELECT * FROM letters
        ORDER BY created_at DESC
      `;

      return res.status(200).json(letters);

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  // POST carta nueva
  if (req.method === 'POST') {
    try {

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

    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({
    error: 'Method not allowed'
  });
}