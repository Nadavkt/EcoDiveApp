import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE_URL } from '../../../services/api';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [serverProfile, setServerProfile] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const load = async () => {
        if (!user?.id) return;
        try {
          setRefreshing(true);
          const res = await fetch(`${API_BASE_URL}/users/${user.id}`);
          const data = await res.json();
          if (res.ok && data.success && isActive) {
            setServerProfile(data.data);
          }
        } catch (e) {
          // silent fail
        } finally {
          if (isActive) setRefreshing(false);
        }
      };
      load();
      return () => { isActive = false; };
    }, [user?.id])
  );
  
  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.header}>
        <Image 
          source={{ 
            uri: serverProfile?.profile_image || user?.profile_image || 'https://i.pravatar.cc/200?img=12' 
          }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>
          {serverProfile ? `${serverProfile.first_name || ''} ${serverProfile.last_name || ''}`.trim() : (user ? `${user.first_name} ${user.last_name}` : 'Guest User')}
        </Text>
        <Text style={styles.email}>
          {serverProfile?.email || user?.email || 'No email available'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Diving Details</Text>
        <View style={styles.row}>
          <Text style={styles.key}>License Type</Text>
          <Text style={styles.value}>PADI Open Water</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.key}>Insurance Expiry</Text>
          <Text style={styles.value}>31/12/2025</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/(tabs)/More/Edit-Profile')}>
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
          <Text style={[styles.actionText, { color: '#E11D48' }]}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/(tabs)/More/Delete-Account')}>
          <Text style={[styles.actionText, { color: '#E11D48', fontWeight: '800' }]}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB' },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E6EAF2', margin: 16, marginBottom: 12 },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0B132B' },
  header: { alignItems: 'center', padding: 24, backgroundColor: '#FFFFFF', marginBottom: 12 },
  avatar: { width: 96, height: 96, borderRadius: 48, marginBottom: 12, borderWidth: 2, borderColor: '#4cc5ff' },
  name: { fontSize: 20, fontWeight: '800', color: '#0B132B' },
  email: { fontSize: 14, color: '#515873', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: '#E6EAF2' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0B132B', marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  key: { color: '#515873' },
  value: { color: '#0B132B', fontWeight: '700' },
  actionRow: { paddingVertical: 12 },
  actionText: { color: '#1F7A8C', fontWeight: '700' },
});


