import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';

export default function AddDive() {
  const router = useRouter();

  const handleDiveTypeSelect = (type) => {
    router.push(`/add-dive/${type}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Dive</Text>
      <Text style={styles.subtitle}>Choose your dive type</Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => handleDiveTypeSelect('free')}
        >
          <Fontisto name="snorkel" size={48} color="#4cc5ff" />
          <Text style={styles.optionText}>Free Dive</Text>
          <Text style={styles.optionSubtext}>Record your free diving experience</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.optionButton}
          onPress={() => handleDiveTypeSelect('scuba')}
        >
          <MaterialIcons name="scuba-diving" size={48} color="#4cc5ff" />
          <Text style={styles.optionText}>Scuba Dive</Text>
          <Text style={styles.optionSubtext}>Record your scuba diving experience</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 60,
  },
  optionsContainer: {
    width: '100%',
    gap: 20,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#E9ECEF',
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  optionSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
