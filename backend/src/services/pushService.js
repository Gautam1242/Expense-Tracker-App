import { sql } from "../config/db.js";
import admin from "../config/firebase.js";

export const sendPushNotification = async (userId, title, body) => {
    try {
        if (!admin) {
            console.log("Firebase Admin not initialized. Skipping push.");
            return;
        }

        // Get token
        const tokens = await sql`SELECT token FROM user_push_tokens WHERE user_id=${userId}`;
        if (tokens.length === 0) return;

        const token = tokens[0].token;

        const message = {
            notification: {
                title,
                body
            },
            token: token
        };

        await admin.messaging().send(message);
        console.log("Push notification sent to", userId);

    } catch (error) {
        console.log("Error sending push notification", error);
    }
}
