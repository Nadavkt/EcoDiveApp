import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { diveLogs } from './diveLogs';

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

      <FlatList
        data={diveLogs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/(tabs)/Dive-Log/diveid?id=${item.id}`)}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />

            <View style={styles.cardBody}>
              <Text style={styles.date}>{formatDate(item.date)}</Text>

              <View style={styles.row}> 
                <Ionicons name="location-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                <Text style={styles.rowText}>{item.location}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.row}> 
                  <Ionicons name="time-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                  <Text style={styles.rowText}>{item.durationMinutes} min</Text>
                </View>
                <View style={[styles.row, { marginLeft: 16 }]}> 
                  <Ionicons name="water-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                  <Text style={styles.rowText}>{item.depthMeters} m</Text>
                </View>
                <View style={[styles.row, { marginLeft: 16 }]}> 
                  <Ionicons name="thermometer-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                  <Text style={styles.rowText}>{item.temperatureC}°C</Text>
                </View>
              </View>

              <View style={[styles.row, { marginTop: 8 }]}> 
                <Ionicons name="pulse-outline" size={16} color={colors.slate} style={{ marginRight: 6 }} />
                <Text style={styles.conditions}>
                  {item.conditions.join(', ')}
                </Text>
              </View>
            </View>
          </Pressable>
        )}
      />
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


