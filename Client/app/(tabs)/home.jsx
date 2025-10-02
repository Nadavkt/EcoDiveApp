import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDives } from '../../services/api';

const c = {
  bg: '#F6F7FB',
  header: '#F1FAEE',
  ocean: '#1F7A8C',
  slate: '#515873',
  ink: '#0B132B',
  white: '#FFFFFF',
  foam: '#4cc5ff', // The frame of objects in the dashboard 
  tileBlue: '#E6F0FF',
  tileGreen: '#E7F8ED',
  tileYellow: '#FFF6C8',
  tilePurple: '#EFE8FF',
  kelp: '#2A9D8F',
  coral: '#FF6B6B',
  activeGreen: '#10B981'
};

function computeStats(dives = []) {
  const total = dives.length;
  const deepest = dives.reduce((max, d) => Math.max(max, Number(d.depth || d.max_depth_m || 0)), 0);
  const totalMin = dives.reduce((sum, d) => sum + Number(d.duration || d.duration_min || 0), 0);
  const hrs = Math.floor(totalMin / 60);
  const locations = new Set(dives.map(d => d.dive_site || d.site).filter(Boolean)).size;
  return {
    tiles: [
      { label: 'Total Dives', value: String(total), icon: 'fish', color: c.tileBlue },
      { label: 'Deepest Dive', value: `${deepest}m`, icon: 'trending-up', color: c.tileGreen },
      { label: 'Total Time', value: `${hrs} hrs`, icon: 'time-outline', color: c.tileYellow },
      { label: 'Locations', value: String(locations), icon: 'location-outline', color: c.tilePurple }
    ]
  };
}

export default function Home() {
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
        if (!user?.id_number) { setIsLoading(false); return; }
        const res = await getUserDives(user.id_number);
        setDives(Array.isArray(res) ? res : []);
      } catch (e) {
        setError(e?.message || 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id_number]);

  const { tiles } = computeStats(dives);
  const latest = dives.slice(0, 3).map(d => ({ id: d.id, spot: d.dive_site || d.site || 'Unknown site', date: d.dive_date, minutes: d.duration || d.duration_min || 0 }));
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
      {isLoading && (
        <ActivityIndicator size="large" color={c.ocean} style={{ marginVertical: 8 }} />
      )}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.tilesGrid}>
        {tiles.map((t) => (
          <View key={t.label} style={[styles.tile, { backgroundColor: t.color }] }>
            <Ionicons name={t.icon} size={20} color={c.slate} style={{ marginBottom: 6 }} />
            <Text style={styles.tileValue}>{t.value}</Text>
            <Text style={styles.tileLabel}>{t.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Latest Dives</Text>
        {latest.map((d, i) => (
          <View key={d.id} style={[styles.row, i < latest.length - 1 && styles.rowDivider]}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowLine}>
                <Ionicons name="location-outline" size={16} color={c.slate} style={{ marginRight: 6 }} />
                <Text style={styles.rowTitle}>{d.spot}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto' }}>
                  <Ionicons name="search-outline" size={14} color={c.slate} style={{ marginRight: 4 }} />
                  <Text style={styles.rowMeta}>{d.minutes}m</Text>
                </View>
              </View>
              <View style={[styles.rowLine, { marginTop: 4 }]}>
                <Ionicons name="calendar-outline" size={14} color={c.slate} style={{ marginRight: 6 }} />
                <Text style={styles.rowSub}>{fmtDate(d.date)}</Text>
              </View>
            </View>
          </View>
        ))}
        <Pressable onPress={() => router.push('/(tabs)/Dive-Log')} style={styles.linkRow}>
          <Ionicons name="eye-outline" size={18} color={c.ocean} style={{ marginRight: 8 }} />
          <Text style={styles.linkText}>View All Logs</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Insurance Status</Text>
      <View style={styles.card}>
        <Text style={styles.insTitle}>Diving Certification</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusKey}>License Type:</Text>
          <Text style={styles.statusVal}>PADI Open Water</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusKey}>Expiry Insurance Date:</Text>
          <Text style={styles.statusVal}>31/12/2025</Text>
        </View>
        <View style={[styles.statusRow, { marginTop: 6 }]}>
          <Text style={styles.statusKey}>Status:</Text>
          <Text style={[styles.badge, styles.badgeActive]}>Active</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
  } catch {
    return iso;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.bg },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222',
    marginBottom: 12
  },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: {
    width: '48%',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14
  },
  tileValue: { fontSize: 22, fontWeight: '800', color: c.ink },
  tileLabel: { marginTop: 6, fontSize: 12, color: c.slate },

  card: {
    backgroundColor: c.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.foam,
    padding: 14,
    marginTop: 8
  },
  cardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, color: '#222' },

  row: { paddingVertical: 10 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: c.foam },
  rowLine: { flexDirection: 'row', alignItems: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: c.ink },
  rowSub: { fontSize: 12, color: c.slate },
  rowMeta: { fontSize: 12, color: c.slate },

  linkRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  linkText: { color: c.ocean, fontWeight: '700' },

  insTitle: { fontSize: 16, fontWeight: '800', marginBottom: 8, color: c.ink },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  statusKey: { fontSize: 13, color: c.slate },
  statusVal: { fontSize: 13, fontWeight: '700', color: c.ink },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, color: '#fff', fontWeight: '800', overflow: 'hidden' },
  badgeActive: { backgroundColor: c.activeGreen },
  badgeInactive: { backgroundColor: c.coral }
});
