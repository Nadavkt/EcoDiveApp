import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getDiveById } from './diveLogs';

const colors = {
  bg: '#F6F7FB',
  white: '#FFFFFF',
  slate: '#515873',
  ink: '#0B132B',
  border: '#E6EAF2',
  ocean: '#1F7A8C',
  foam: '#4cc5ff'
};

export default function DiveDetail() {
  const router = useRouter();
  const { id, dive: diveParam } = useLocalSearchParams();
  let dive = null;
  if (diveParam) {
    try { dive = JSON.parse(diveParam); } catch {}
  }
  if (!dive) {
    dive = getDiveById(id);
  }

  const formatDate = (dateString) => {
    try {
      const s = String(dateString);
      // handle YYYY-MM-DD without timezone shift
      const date = s.length === 10 ? new Date(`${s}T00:00:00`) : new Date(s);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  if (!dive) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Not Found</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Dive details not found</Text>
        </View>
      </View>
    );
  }

function safeJsonArray(text) {
  try {
    const v = JSON.parse(text);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Dive Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Dive Image or placeholder icon */}
        {dive?.image ? (
          <Image source={{ uri: dive.image }} style={styles.diveImage} />
        ) : (
          <View style={[styles.diveImage, styles.noImagePlaceholder]}>
            <Ionicons name="image-outline" size={96} color={colors.slate} />
            <Text style={{ color: colors.slate, marginTop: 8, fontWeight: '800', fontSize: 14 }}>No image</Text>
          </View>
        )}

        {/* Main Info Card */}
        <View style={styles.mainCard}>
          <Text style={styles.diveDate}>{formatDate(dive.dive_date || dive.date)}</Text>
          <Text style={styles.location}>{dive.dive_site || dive.site || dive.location}</Text>
          
          {/* Dive Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="water-outline" size={20} color={colors.ocean} />
              <Text style={styles.statValue}>{(dive.depth ?? dive.max_depth_m ?? dive.depthMeters) || 0}m</Text>
              <Text style={styles.statLabel}>Depth</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color={colors.ocean} />
              <Text style={styles.statValue}>{(dive.duration ?? dive.duration_min ?? dive.durationMinutes) || 0}min</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            {/* Temperature not in current schema */}
          </View>
        </View>

        {/* Conditions Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dive Conditions</Text>
          <View style={styles.conditionsContainer}>
            {(() => {
              const cond = dive.conditions;
              const arr = Array.isArray(cond)
                ? cond
                : (typeof cond === 'string' ? (safeJsonArray(cond) || [cond]) : []);
              return arr.map((condition, index) => (
                <View key={index} style={styles.conditionTag}>
                  <Text style={styles.conditionText}>{String(condition)}</Text>
                </View>
              ));
            })()}
          </View>
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dive Notes</Text>
          <Text style={styles.notesText}>{dive.description || dive.notes || '—'}</Text>
        </View>

        {/* Confirmation Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dive Confirmation</Text>
          <Text style={{ fontWeight: '800', color: colors.ink }}>Feature coming soon</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={colors.foam} style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Share Dive</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color={colors.foam} style={{ marginRight: 8 }} />
            <Text style={styles.actionButtonText}>Export PDF</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.ink,
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  diveImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  noImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  mainCard: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  diveDate: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 8,
  },
  location: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.slate,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.slate,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 12,
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionTag: {
    backgroundColor: colors.foam,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  conditionText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 16,
    color: colors.slate,
    lineHeight: 24,
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmationText: {
    fontSize: 16,
    color: colors.ink,
    fontWeight: '600',
  },
  signatureContainer: {
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 14,
    color: colors.slate,
    marginBottom: 8,
  },
  signatureImage: {
    width: 200,
    height: 60,
    backgroundColor: colors.bg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.foam,
  },
  actionButtonText: {
    color: colors.foam,
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: colors.slate,
  },
});
