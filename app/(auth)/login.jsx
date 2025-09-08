import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
  const router = useRouter();
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');

  const onSignIn = () => {
    // TODO: auth; for now go to tabs
    router.replace('/(tabs)/home');
  };

  const onRegister = () => {
    router.push('/(auth)/register');
  };

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Dive in to your{`\n`}environment</Text>
        <Text style={styles.subtitle}>Log in to your account and manage your dives</Text>

        <TextInput
          style={styles.input}
          placeholder="ID Number"
          placeholderTextColor="#9CA3AF"
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={onSignIn}>
          <Text style={styles.primaryText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 12 }]} onPress={onRegister}>
          <Text style={styles.primaryText}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center'
  },
  centerContent: {
    justifyContent: 'center'
  },
  headerTitle: {
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 34
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 14,
    marginBottom: 28
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginTop: 18
  },
  primaryBtn: {
    backgroundColor: '#4cc5ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 26
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  },
  link: {
    color: '#2563EB',
    fontWeight: '700'
  }
});


