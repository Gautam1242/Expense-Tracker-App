import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../constants/api";
import { Alert } from "react-native";

export const useNotifications = (userId) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/notifications/${userId}`);
            if (response.data.success) {
                setNotifications(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await axios.put(`${API_URL}/notifications/${id}/read`);
            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
        } catch (error) {
            console.log("Error marking as read:", error);
        }
    };

    const deleteNotification = async (id) => {
        try {
            await axios.delete(`${API_URL}/notifications/${id}`);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        } catch (error) {
            Alert.alert("Error", "Failed to delete notification");
        }
    };

    const clearAll = async () => {
        try {
            await axios.delete(`${API_URL}/notifications/all/${userId}`);
            setNotifications([]);
        } catch (error) {
            Alert.alert("Error", "Failed to clear notifications");
        }
    }

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return {
        notifications,
        loading,
        fetchNotifications,
        markAsRead,
        deleteNotification,
        clearAll,
        unreadCount,
    };
};
