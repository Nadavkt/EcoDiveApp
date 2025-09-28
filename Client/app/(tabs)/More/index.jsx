import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function More() {
  const router = useRouter();
  return (
    <View style={styles.container}>

      <View style={styles.tilesRow}>
        <TouchableOpacity style={styles.tile} onPress={() => router.push('/(tabs)/More/clubs')}>
          <Ionicons name="people" size={42} color="#4cc5ff" />
          <Text style={styles.tileTitle}>Dive Clubs</Text>
          <Text style={styles.tileSub}>Find and explore dive clubs near you</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => router.push('/(tabs)/More/profile')}>
          <Ionicons name="person-circle" size={42} color="#4cc5ff" />
          <Text style={styles.tileTitle}>Profile</Text>
          <Text style={styles.tileSub}>Manage your personal information</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tile} onPress={() => router.push('/(tabs)/More/sites/sites')}>
          <Ionicons name="map" size={42} color="#4cc5ff" />
          <Text style={styles.tileTitle}>Dive Sites</Text>
          <Text style={styles.tileSub}>Discover amazing global dive spots</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center'
  },
  tilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  tile: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 12
  },
  tileTitle: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '800',
    color: '#0B132B'
  },
  tileSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#515873',
    textAlign: 'center',
    paddingHorizontal: 8
  }
});
