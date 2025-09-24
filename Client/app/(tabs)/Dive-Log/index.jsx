import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserDives } from '../../../services/api';
import { useFocusEffect } from '@react-navigation/native';

const colors = {
  bg: '#F6F7FB',
  white: '#FFFFFF',
  slate: '#515873',
  ink: '#0B132B',
  border: '#E6EAF2',
  ocean: '#1F7A8C'
};

export default function DiveLog() {
  const router = useRouter();
  const { user } = useAuth();
  const [dives, setDives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        if (!user?.id_number) {
          setError('Missing user id');
          setIsLoading(false);
          return;
        }
        const res = await getUserDives(user.id_number);
        setDives(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Failed to load dives', e);
        setError(e?.message || 'Failed to load dives');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id_number]);

  // Reload when screen is focused (e.g., after saving a dive)
  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const refresh = async () => {
        try {
          if (!user?.id_number) return;
          const res = await getUserDives(user.id_number);
          if (isActive) setDives(Array.isArray(res) ? res : []);
        } catch {}
      };
      refresh();
      return () => { isActive = false; };
    }, [user?.id_number])
  );

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Recent Dives</Text>
        <Pressable style={styles.filterBtn} onPress={() => {}}>
          <Ionicons name="filter" size={16} color={colors.slate} style={{ marginRight: 6 }} />
          <Text style={styles.filterText}>Filter/Sort</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.ocean} style={{ marginTop: 20 }} />
      ) : (
      <FlatList
        data={dives}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => {
              const payload = encodeURIComponent(JSON.stringify(item));
              router.push(`/(tabs)/Dive-Log/diveid?id=${item.id}&dive=${payload}`);
            }}
          >
            {!!item.image && <Image source={{ uri: item.image }} style={styles.cardImage} />}

            <View style={styles.cardBody}>
              <Text style={styles.date}>{formatDate(item.dive_date || item.date)}</Text>

              <View style={styles.row}> 
                <Ionicons name="location-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                <Text style={styles.rowText}>{item.dive_site || item.site || 'Unknown site'}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.row}> 
                  <Ionicons name="time-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                  <Text style={styles.rowText}>{item.duration ?? item.duration_min ?? item.durationMinutes ?? '-'} min</Text>
                </View>
                <View style={[styles.row, { marginLeft: 16 }]}> 
                  <Ionicons name="water-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                  <Text style={styles.rowText}>{item.depth ?? item.max_depth_m ?? item.depthMeters ?? '-'} m</Text>
                </View>
                {/* No temperature column in schema; omit */}
              </View>

              <View style={[styles.row, { marginTop: 8 }]}> 
                <Ionicons name="pulse-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                {(() => {
                  const cond = item.conditions;
                  let text = '';
                  if (Array.isArray(cond)) text = cond.join(', ');
                  else if (typeof cond === 'string') {
                    try { const arr = JSON.parse(cond); text = Array.isArray(arr) ? arr.join(', ') : cond; }
                    catch { text = cond; }
                  }
                  return text ? <Text style={styles.conditions}>{text}</Text> : null;
                })()}
              </View>
            </View>
          </Pressable>
        )}
      />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '800', color: colors.ink },
  filterBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  filterText: { color: colors.slate, fontWeight: '600', fontSize: 12 },

  card: { backgroundColor: colors.white, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: 14 },
  cardImage: { width: '100%', height: 160 },
  cardBody: { padding: 12 },

  date: { fontSize: 16, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowText: { color: colors.ink, fontSize: 13, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  conditions: { color: colors.ocean, fontWeight: '700', fontSize: 12 }
});


