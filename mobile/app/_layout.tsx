import { Stack } from "expo-router";
import SafeScreen from "./../components/SafeScreen.jsx";

export default function RootLayout() {
  return (
    <SafeScreen>
      <Stack />
    </SafeScreen>
  );
}
