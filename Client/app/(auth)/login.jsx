import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { loginUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [idNumber, setIdNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSignIn = async () => {
    try {
      if (!idNumber || !password) {
        Alert.alert('Missing fields', 'Please enter both ID number and password.');
        return;
      }

      setIsLoading(true);
      console.log('Attempting login for ID:', idNumber);

      const response = await loginUser({
        idNumber: idNumber.trim(),
        password: password
      });

      console.log('Login response:', response);

      if (response.success) {
        // Store user data in context
        login(response.user);
        
        Alert.alert('Welcome!', `Hello ${response.user.first_name}!`, [
          { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
        ]);
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert('Login Failed', err.message || 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
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

        <TouchableOpacity 
          style={[styles.primaryBtn, isLoading && styles.disabledBtn]} 
          onPress={onSignIn}
          disabled={isLoading}
        >
          <Text style={styles.primaryText}>
            {isLoading ? 'Logging In...' : 'Log In'}
          </Text>
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
  disabledBtn: {
    backgroundColor: '#9CA3AF',
    opacity: 0.7
  },
  link: {
    color: '#2563EB',
    fontWeight: '700'
  }
});


