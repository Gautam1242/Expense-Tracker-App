import { sql } from "../config/db.js";
import { sendPushNotification } from "../services/pushService.js";

export const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        // Check for daily greeting
        const existingGreeting = await sql`
      SELECT * FROM notifications 
      WHERE user_id=${userId} 
      AND type='greeting' 
      AND created_at::DATE = CURRENT_DATE
    `;

        if (existingGreeting.length === 0) {
            const hour = new Date().getHours();
            let greeting = "Good Morning! Have a great day ahead.";
            if (hour >= 12 && hour < 17) greeting = "Good Afternoon! Hope your day is going well.";
            else if (hour >= 17) greeting = "Good Evening! Time to relax.";

            await sql`
        INSERT INTO notifications (user_id, message, type) 
        VALUES (${userId}, ${greeting}, 'greeting')
      `;

            // SEND PUSH NOTIFICATION
            await sendPushNotification(userId, "Daily Greeting", greeting);
        }

        const notifications = await sql`
      SELECT * FROM notifications 
      WHERE user_id=${userId} 
      ORDER BY created_at DESC
    `;

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        console.log("Error fetching notifications", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await sql`UPDATE notifications SET is_read = TRUE WHERE id=${id}`;
        res.status(200).json({ success: true, message: "Marked as read" });
    } catch (error) {
        console.log("Error marking notification as read", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        await sql`DELETE FROM notifications WHERE id=${id}`;
        res.status(200).json({ success: true, message: "Notification deleted" });
    } catch (error) {
        console.log("Error deleting notification", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const clearAllNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        await sql`DELETE FROM notifications WHERE user_id=${userId}`;
        res.status(200).json({ success: true, message: "All notifications cleared" });
    } catch (error) {
        console.log("Error clearing notifications", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
