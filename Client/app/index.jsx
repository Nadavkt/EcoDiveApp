import React from 'react';
import { Redirect } from 'expo-router';

export default function AppEntry() {
  // Redirect to preOpen screen when app first loads
  return <Redirect href="/(auth)/preOpen" />;
}