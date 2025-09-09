import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const router = useRouter();
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
        <Image source={{ uri: 'https://i.pravatar.cc/200?img=12' }} style={styles.avatar} />
        <Text style={styles.name}>Nadav Kantor</Text>
        <Text style={styles.email}>nadav@example.com</Text>
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
        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow}>
          <Text style={[styles.actionText, { color: '#E11D48' }]}>Log Out</Text>
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


