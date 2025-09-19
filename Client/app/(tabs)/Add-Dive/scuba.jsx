import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ScubaDiveForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    diveType: 'Scuba Dive',
    date: '',
    diveNumber: '',
    bodyDiver: '',
    site: '',
    description: '',
    duration: '',
    depth: '',
    weight: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSitePicker, setShowSitePicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(new Date());

  // Predefined list of dive sites
  const diveSites = [
    'Great Barrier Reef, Australia',
    'Blue Hole, Egypt',
    'Silfra, Iceland',
    'Barracuda Point, Malaysia',
    'SS Thistlegorm, Egypt',
    'Manta Point, Indonesia',
    'Shark Point, Thailand',
    'Blue Corner, Palau',
    'SS Yongala, Australia',
    'Manta Ray Night Dive, Hawaii',
    'Cenotes, Mexico',
    'Galapagos Islands, Ecuador',
    'Raja Ampat, Indonesia',
    'Komodo National Park, Indonesia',
    'Tubbataha Reefs, Philippines',
    'Other (Custom)'
  ];

  const handleSave = () => {
    // Validate required fields
    if (!formData.date || !formData.diveNumber || !formData.site) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    // Here you would typically save the data
    Alert.alert('Success', 'Scuba dive saved successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
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
        <Text style={styles.headerTitle}>My Scuba Dive</Text>
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Scuba Dive</Text>
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
            <ScrollView style={styles.siteList}>
              {diveSites.map((site, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.siteOption}
                  onPress={() => handleSiteSelect(site)}
                >
                  <Text style={styles.siteOptionText}>{site}</Text>
                </TouchableOpacity>
              ))}
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
