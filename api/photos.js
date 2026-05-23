import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {

    try {

        // ===== GET =====
        if (req.method === "GET") {

            const result = await cloudinary.search
                .expression('folder:9meses')
                .sort_by('created_at', 'desc')
                .max_results(100)
                .execute();

            return res.status(200).json(result.resources);
        }

        // ===== POST =====
        if (req.method === "POST") {

            const { image } = req.body;

            const upload = await cloudinary.uploader.upload(image, {
                folder: "9meses"
            });

            return res.status(200).json(upload);
        }

        // ===== DELETE =====
        if (req.method === "DELETE") {

            const { public_id } = req.body;

            if (!public_id) {

                return res.status(400).json({
                    error: "Missing public_id"
                });
            }

            await cloudinary.uploader.destroy(public_id);

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