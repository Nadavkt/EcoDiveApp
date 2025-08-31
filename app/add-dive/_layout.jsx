import { Stack } from 'expo-router';

export default function AddDiveLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="free" />
      <Stack.Screen name="scuba" />
    </Stack>
  );
}
