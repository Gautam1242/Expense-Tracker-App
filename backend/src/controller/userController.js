import { sql } from "../config/db.js";

export const savePushToken = async (req, res) => {
    try {
        const { userId, token } = req.body;
        if (!userId || !token) {
            return res.status(400).json({ success: false, message: "Missing userId or token" });
        }

        await sql`
      INSERT INTO user_push_tokens (user_id, token)
      VALUES (${userId}, ${token})
      ON CONFLICT (user_id) 
      DO UPDATE SET token = ${token}, updated_at = CURRENT_TIMESTAMP
    `;

        res.status(200).json({ success: true, message: "Token saved" });
    } catch (error) {
        console.log("Error saving push token", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
