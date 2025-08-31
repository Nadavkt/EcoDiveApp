import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AddDive() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Dive</Text>
      <Text style={styles.subtitle}>Add new dive functionality coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
