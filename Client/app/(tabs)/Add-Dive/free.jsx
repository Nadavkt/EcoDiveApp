import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../../contexts/AuthContext';
import { createDive, API_BASE_URL } from '../../../services/api';

export default function FreeDiveForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    diveType: 'Free Dive',
    date: '',
    diveNumber: '',
    bodyDiver: '',
    site: '',
    description: '',
    duration: '',
    depth: '',
    weight: '',
    conditions: []
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSitePicker, setShowSitePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(new Date());

  // Live dive sites from API
  const [allSites, setAllSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(false);
  const [sitesError, setSitesError] = useState('');
  const [userCoords, setUserCoords] = useState(null);
  const [requestingLocation, setRequestingLocation] = useState(false);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setSitesLoading(true);
        const res = await fetch(`${API_BASE_URL}/dive-sites`);
        if (!res.ok) throw new Error('Failed to fetch dive sites');
        const data = await res.json();
        setAllSites(Array.isArray(data) ? data : []);
        setSitesError('');
      } catch (e) {
        setSitesError(e.message);
      } finally {
        setSitesLoading(false);
      }
    };
    fetchSites();
  }, []);

  const requestLocation = async () => {
    try {
      setRequestingLocation(true);
      const Location = (await import('expo-location'));
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location denied', 'Showing all sites without filtering.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
    } catch (e) {
      Alert.alert('Location error', e.message);
    } finally {
      setRequestingLocation(false);
    }
  };

  const distanceKm = (a, b) => {
    if (!a || !b) return Number.POSITIVE_INFINITY;
    const R = 6371;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLon = (b.lon - a.lon) * Math.PI / 180;
    const lat1 = a.lat * Math.PI / 180;
    const lat2 = b.lat * Math.PI / 180;
    const x = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(lat1) * Math.cos(lat2);
    const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
    return R * d;
  };

  const filteredSites = useMemo(() => {
    if (!userCoords) return allSites;
    const withCoords = allSites.filter(s => s.latitude != null && s.longitude != null);
    return withCoords
      .map(s => ({ ...s, _dist: distanceKm(userCoords, { lat: Number(s.latitude), lon: Number(s.longitude) }) }))
      .sort((a, b) => a._dist - b._dist);
  }, [allSites, userCoords]);

  const handleSave = async () => {
    try {
      if (!formData.date || !formData.site) {
        Alert.alert('Missing Information', 'Please fill in date and site.');
        return;
      }
      if (!user?.id_number) {
        Alert.alert('Not logged in', 'Please log in again.');
        return;
      }
      const [day, month, year] = String(formData.date).split('/');
      const dateOnly = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      const payload = {
        idNumber: user.id_number,
        diveDate: dateOnly,
        diveType: 'free',
        site: formData.site,
        maxDepthM: formData.depth ? Number(formData.depth) : null,
        durationMin: formData.duration ? parseInt(formData.duration.split(':')[0], 10) * 60 + parseInt(formData.duration.split(':')[1] || '0', 10) : null,
        weightsKg: formData.weight ? Number(formData.weight) : null,
        bodyDiver: formData.bodyDiver || null,
        description: formData.description || null,
        diveNumber: formData.diveNumber ? Number(formData.diveNumber) : undefined,
        conditions: formData.conditions
      };

      await createDive(payload);
      Alert.alert('Success', 'Free dive saved!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      console.error('Save free dive failed', e);
      Alert.alert('Save failed', e?.message || 'Could not save free dive.');
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      updateFormData('date', formattedDate);
    }
  };

  const openDatePicker = () => {
    console.log('Opening date picker...');
    setShowDatePicker(true);
  };

  const handleSiteSelect = (site) => {
    setShowSitePicker(false);
    if (site === 'Other (Custom)') {
      // Allow custom input for "Other"
      Alert.prompt(
        'Enter Custom Site',
        'Please enter the name of your dive site:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'OK', 
            onPress: (customSite) => {
              if (customSite && customSite.trim()) {
                updateFormData('site', customSite.trim());
              }
            }
          }
        ],
        'plain-text'
      );
    } else {
      updateFormData('site', site);
    }
  };

  const handleDurationChange = (event, time) => {
    if (Platform.OS === 'android') {
      setShowDurationPicker(false);
    }
    if (time) {
      setSelectedDuration(time);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      
      // Check if duration is within 5 hours limit
      if (hours > 5 || (hours === 5 && minutes > 0)) {
        Alert.alert('Invalid Duration', 'Duration cannot exceed 5 hours.');
        return;
      }
      
      const formattedDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      updateFormData('duration', formattedDuration);
    }
  };

  const openDurationPicker = () => {
    console.log('Opening duration picker...');
    setShowDurationPicker(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Free Dive</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Dive Type</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.diveType}
            editable={false}
            placeholder="Dive Type"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Date *</Text>
          <TouchableOpacity style={styles.dateInput} onPress={openDatePicker}>
            <Text style={formData.date ? styles.dateText : styles.placeholderText}>
              {formData.date || 'Select dive date'}
            </Text>
            <Ionicons name="calendar" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Dive Number # *</Text>
          <TextInput
            style={styles.input}
            value={formData.diveNumber}
            onChangeText={(text) => updateFormData('diveNumber', text)}
            placeholder="Enter dive number"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Body Diver</Text>
          <TextInput
            style={styles.input}
            value={formData.bodyDiver}
            onChangeText={(text) => updateFormData('bodyDiver', text)}
            placeholder="Enter body diver info"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Site *</Text>
          <TouchableOpacity style={styles.siteInput} onPress={() => setShowSitePicker(true)}>
            <Text style={formData.site ? styles.siteText : styles.placeholderText}>
              {formData.site || 'Select dive site'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => updateFormData('description', text)}
            placeholder="Enter dive description"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Duration (up to 5 hours)</Text>
          <TouchableOpacity style={styles.durationInput} onPress={openDurationPicker}>
            <Text style={formData.duration ? styles.durationText : styles.placeholderText}>
              {formData.duration || 'Select duration'}
            </Text>
            <Ionicons name="time" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Depth (meters)</Text>
          <TextInput
            style={styles.input}
            value={formData.depth}
            onChangeText={(text) => updateFormData('depth', text)}
            placeholder="Enter depth in meters"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={formData.weight}
            onChangeText={(text) => updateFormData('weight', text)}
            placeholder="Enter weight in kg"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>

        {/* Conditions tags */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Conditions</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['Current', 'Waves', 'Drift', 'Night', 'Cold', 'Shore', 'Boat'].map((tag) => {
              const selected = formData.conditions.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => {
                    const set = new Set(formData.conditions);
                    if (set.has(tag)) set.delete(tag); else set.add(tag);
                    updateFormData('conditions', Array.from(set));
                  }}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: selected ? '#4cc5ff' : '#E5E7EB',
                    backgroundColor: selected ? '#E0F6FF' : '#FFFFFF'
                  }}
                >
                  <Text style={{ color: selected ? '#0B132B' : '#333', fontWeight: '600' }}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Free Dive</Text>
        </TouchableOpacity>
      </ScrollView>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )
      )}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDurationPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Duration</Text>
                <TouchableOpacity onPress={() => setShowDurationPicker(false)}>
                  <Text style={styles.modalButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={selectedDuration}
                mode="time"
                display="spinner"
                onChange={handleDurationChange}
                is24Hour={true}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDurationPicker && (
          <DateTimePicker
            value={selectedDuration}
            mode="time"
            display="default"
            onChange={handleDurationChange}
            is24Hour={true}
          />
        )
      )}

      <Modal
        visible={showSitePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSitePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Dive Site</Text>
              <TouchableOpacity onPress={() => setShowSitePicker(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>
              <TouchableOpacity onPress={requestLocation} disabled={requestingLocation} style={{ alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                <Text style={{ color: '#0B132B', fontWeight: '600' }}>{requestingLocation ? 'Locating…' : 'Use My Location'}</Text>
              </TouchableOpacity>
              {!!sitesError && <Text style={{ color: '#B91C1C', marginTop: 8 }}>{sitesError}</Text>}
            </View>
            <ScrollView style={styles.siteList}>
              {sitesLoading ? (
                <Text style={{ padding: 20, color: '#6B7280' }}>Loading sites…</Text>
              ) : (
                <>
                  {filteredSites.map((s) => (
                    <TouchableOpacity
                      key={s.site_id}
                      style={styles.siteOption}
                      onPress={() => handleSiteSelect(s.name)}
                    >
                      <Text style={styles.siteOptionText}>{s.name}</Text>
                      <Text style={{ color: '#6B7280', fontSize: 12 }}>{s.location}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity style={styles.siteOption} onPress={() => handleSiteSelect('Other (Custom)')}>
                    <Text style={styles.siteOptionText}>Other (Custom)</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 5,
    paddingBottom: 5,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#6B7280',
    borderColor: '#D1D5DB',
  },
  dateInput: {
    backgroundColor: '#ffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  siteInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  siteText: {
    fontSize: 16,
    color: '#333',
  },
  durationText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#4cc5ff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButton: {
    fontSize: 16,
    color: '#2A9D8F',
    fontWeight: '600',
  },
  siteList: {
    padding: 20,
  },
  siteOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  siteOptionText: {
    fontSize: 16,
    color: '#333',
  },
});
