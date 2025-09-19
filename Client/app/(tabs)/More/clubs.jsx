import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const clubs = [
  {
    id: '1',
    name: 'Blue Reef Divers',
    location: 'Tel Aviv, Israel',
    image: 'https://images.unsplash.com/photo-1533903345306-15d1c30952de?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '2',
    name: 'Coral Coast Club',
    location: 'Eilat, Israel',
    image: 'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: '3',
    name: 'Mediterranean Explorers',
    location: 'Haifa, Israel',
    image: 'https://images.unsplash.com/photo-1518933165971-611dbc9c412d?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function Clubs() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Dive Clubs</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <FlatList
        data={clubs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.location}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F7FB', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E6EAF2', marginBottom: 12 },
  backButton: { padding: 6 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: '#0B132B' },
  title: { fontSize: 20, fontWeight: '800', color: '#0B132B', marginBottom: 12, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6EAF2', overflow: 'hidden', marginBottom: 14 },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0B132B' },
  cardSubtitle: { fontSize: 12, color: '#515873', marginTop: 4 },
});


