import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../../services/api';

export default function Clubs() {
  const router = useRouter();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiveClubs();
  }, []);

  const fetchDiveClubs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dive-clubs`);
      const data = await response.json();
      
      if (data.success) {
        setClubs(data.data);
      } else {
        setError(data.error || 'Failed to fetch dive clubs');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClubPress = (club) => {
    router.push({
      pathname: '/More/clubs/Club-Detail',
      params: { club: JSON.stringify(club) }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Clubs</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4cc5ff" />
          <Text style={styles.loadingText}>Loading dive clubs...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Clubs</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load dive clubs</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
        </View>
      </View>
    );
  }

  if (clubs.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Clubs</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.noDataContainer}>
          <Ionicons name="people-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noDataText}>No dive clubs found</Text>
        </View>
      </View>
    );
  }

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
        keyExtractor={(item) => item.club_id.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => handleClubPress(item)}>
            <Image 
              source={{ 
                uri: item.image_url || 'https://images.unsplash.com/photo-1533903345306-15d1c30952de?q=80&w=1200&auto=format&fit=crop' 
              }} 
              style={styles.cardImage} 
            />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.location}</Text>
              {item.description && (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              {item.rating && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
                </View>
              )}
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
  cardDescription: { fontSize: 11, color: '#6B7280', marginTop: 6, lineHeight: 16 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  ratingText: { fontSize: 12, color: '#F59E0B', marginLeft: 4, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { marginTop: 12, fontSize: 16, color: '#EF4444', fontWeight: '600' },
  errorSubtext: { marginTop: 4, fontSize: 14, color: '#6B7280', textAlign: 'center' },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataText: { marginTop: 12, fontSize: 16, color: '#9CA3AF' },
});


