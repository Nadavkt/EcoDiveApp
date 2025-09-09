import React from 'react';
import { Stack } from 'expo-router';

export default function MoreLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="clubs" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="sites" />
    </Stack>
  );
}


