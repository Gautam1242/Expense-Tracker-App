
import { useState, useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

async function requestUserPermission() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    // Firebase permission
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
}

export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState('');
    const [channels, setChannels] = useState([]);
    const [notification, setNotification] = useState(
        undefined
    );
    const notificationListener = useRef(undefined);
    const responseListener = useRef(undefined);

    useEffect(() => {
        requestUserPermission();

        // Get FCM token
        messaging()
            .getToken()
            .then(token => {
                console.log('FCM Token:', token);
                setExpoPushToken(token);
            });

        // Listen to whether the token has been refreshed
        const unsubscribeTokenRefresh = messaging().onTokenRefresh(token => {
            console.log('FCM Token Refreshed:', token);
            setExpoPushToken(token);
        });

        // Handle initial notification if app was opened from quit state
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    console.log(
                        'Notification caused app to open from quit state:',
                        remoteMessage.notification,
                    );
                }
            });

        // Handle notification if app was opened from background state
        const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
            remoteMessage => {
                console.log(
                    'Notification caused app to open from background state:',
                    remoteMessage.notification,
                );
            },
        );

        // Foreground message handler
        const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
            console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));

            // Schedule a local notification to show the alert
            if (remoteMessage.notification) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: remoteMessage.notification.title || 'Notification',
                        body: remoteMessage.notification.body || '',
                        data: remoteMessage.data,
                    },
                    trigger: null, // show immediately
                });
            }
        });

        if (Platform.OS === 'android') {
            Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
        }

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            unsubscribeTokenRefresh();
            unsubscribeOnNotificationOpened();
            unsubscribeForeground();
            if (notificationListener.current) {
                notificationListener.current.remove();
            }
            if (responseListener.current) {
                responseListener.current.remove();
            }
        };
    }, []);

    return {
        expoPushToken,
        notification,
    };
}
