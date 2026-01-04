import express from "express";
import {
    getUserNotifications,
    markAsRead,
    deleteNotification,
    clearAllNotifications
} from "../controller/notificationController.js";

const router = express.Router();

router.get("/notifications/:userId", getUserNotifications);
router.put("/notifications/:id/read", markAsRead);
router.delete("/notifications/:id", deleteNotification);
router.delete("/notifications/all/:userId", clearAllNotifications);

export default router;
