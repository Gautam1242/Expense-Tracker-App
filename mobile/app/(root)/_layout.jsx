import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { Stack } from "expo-router/stack";
import { useEffect } from "react";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import axios from "axios";
import { API_URL } from "../../constants/api";

export default function Layout() {
  const { isSignedIn, isLoaded, user } = useUser();
  const { expoPushToken } = usePushNotifications(); // This hook handles both permissions and token generation

  useEffect(() => {
    const saveToken = async () => {
      if (isSignedIn && user?.id && expoPushToken) {
        try {
          console.log("Saving push token for user:", user.id);
          await axios.post(`${API_URL}/user/push-token`, {
            userId: user.id,
            token: expoPushToken,
          });
        } catch (error) {
          console.log("Error saving push token:", error);
        }
      }
    };
    saveToken();
  }, [isSignedIn, user, expoPushToken]);

  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href={"/sign-in"} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
