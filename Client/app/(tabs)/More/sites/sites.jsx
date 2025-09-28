import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../../services/api';

export default function Sites() {
  const router = useRouter();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiveSites();
  }, []);

  const fetchDiveSites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dive-sites`);
      if (!response.ok) {
        throw new Error('Failed to fetch dive sites');
      }
      const data = await response.json();
      setSites(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dive sites:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSitePress = (site) => {
    router.push({
      pathname: '/More/sites/Dive-Site-Detail',
      params: { site: JSON.stringify(site) }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Sites</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1F7A8C" />
          <Text style={styles.loadingText}>Loading dive sites...</Text>
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
          <Text style={styles.headerTitle}>Dive Sites</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>Failed to load dive sites</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchDiveSites}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (sites.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Sites</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.noDataContainer}>
          <Ionicons name="location-outline" size={48} color="#515873" />
          <Text style={styles.noDataText}>No Data</Text>
          <Text style={styles.noDataSubtext}>No dive sites available at the moment</Text>
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
        <Text style={styles.headerTitle}>Dive Sites</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={sites}
        keyExtractor={(item) => item.site_id.toString()}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => handleSitePress(item)}>
            <View style={styles.cardImage}>
              <Ionicons name="location-outline" size={48} color="#4cc5ff" />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>{item.location}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.description}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#515873" />
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#515873' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, fontWeight: '600', color: '#FF6B6B', marginTop: 16 },
  errorSubtext: { fontSize: 14, color: '#515873', marginTop: 8, textAlign: 'center' },
  retryButton: { backgroundColor: '#1F7A8C', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  retryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noDataText: { fontSize: 18, fontWeight: '600', color: '#515873', marginTop: 16 },
  noDataSubtext: { fontSize: 14, color: '#515873', marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6EAF2', marginBottom: 14, flexDirection: 'row', alignItems: 'center', padding: 16 },
  cardImage: { width: 60, height: 60, backgroundColor: '#F6F7FB', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#0B132B' },
  cardSubtitle: { fontSize: 12, color: '#515873', marginTop: 4 },
  cardDescription: { fontSize: 14, color: '#515873', marginTop: 8, lineHeight: 20 },
});


