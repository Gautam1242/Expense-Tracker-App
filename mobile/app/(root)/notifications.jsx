import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet, Alert } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { useNotifications } from "../../hooks/useNotifications";
import { useEffect, useState } from "react";
import { Stack, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import PageLoader from "../../components/PageLoader";

export default function Notifications() {
    const { user } = useUser();
    const router = useRouter();
    const {
        notifications,
        loading,
        fetchNotifications,
        markAsRead,
        deleteNotification,
        clearAll,
    } = useNotifications(user.id);

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    };

    const handleClearAll = () => {
        Alert.alert("Clear All", "Are you sure you want to clear all notifications?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: clearAll },
        ]);
    };

    if (loading && !refreshing && notifications.length === 0) return <PageLoader />;

    return (
        <>
            <Stack.Screen
                options={{
                    headerTitle: "Notifications",
                    headerRight: () => (
                        notifications.length > 0 && (
                            <TouchableOpacity onPress={handleClearAll} style={{ marginRight: 10 }}>
                                <Text style={{ color: "red", fontWeight: "bold" }}>Clear All</Text>
                            </TouchableOpacity>
                        )
                    ),
                }}
            />
            <View style={styles.container}>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item.id.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="notifications-off-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>No notifications</Text>
                        </View>
                    }
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.item, !item.is_read && styles.unreadItem]}
                            onPress={() => !item.is_read && markAsRead(item.id)}
                        >
                            <View style={styles.itemContent}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={item.type === 'greeting' ? "sunny" : "card"}
                                        size={24}
                                        color="#fff"
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <Text style={styles.message}>{item.message}</Text>
                                    <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
                                </View>
                                <TouchableOpacity onPress={() => deleteNotification(item.id)} style={styles.deleteBtn}>
                                    <Ionicons name="close" size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    unreadItem: {
        backgroundColor: "#e6f7ff",
    },
    itemContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    message: {
        fontSize: 16,
        color: "#333",
    },
    date: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 10,
    },
    deleteBtn: {
        padding: 5,
    }
});
