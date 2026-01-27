import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right', // or 'fade', 'slide_from_bottom', etc.
        headerShown: false, // since we have custom headers
      }}
    />
  );
}