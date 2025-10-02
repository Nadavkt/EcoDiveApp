import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../../services/api';

const colors = {
  bg: '#F6F7FB',
  white: '#FFFFFF',
  slate: '#515873',
  ocean: '#4cc5ff',
  border: '#E6EAF2',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  ink: '#0B132B'
};

export default function EditProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const resolveUrl = (uri) => {
    if (!uri) return '';
    if (uri.startsWith('http://') || uri.startsWith('https://')) return uri;
    // handle relative paths like /uploads/...
    return `${API_BASE_URL}${uri}`;
  };
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    id_number: '',
    profile_image: '',
    license_front: '',
    license_back: ''
  });
  const [pendingUploads, setPendingUploads] = useState({
    profile_image_base64: null,
    license_base64: null,
    license_back_base64: null,
  });

  useEffect(() => {
    if (user?.id) {
      loadProfile(user.id);
    }
  }, [user?.id]);

  const loadProfile = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/users/${userId}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to load profile');
      const u = data.data;
      setFormData({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        email: u.email || '',
        id_number: u.id_number || '',
        profile_image: u.profile_image || u.profile_image_url || '',
        license_front: u.license_front || u.license_front_url || '',
        license_back: u.license_back || u.license_back_url || ''
      });
      setLoadError('');
    } catch (e) {
      console.warn('Profile load error:', e.message);
      setLoadError('Failed to load profile. Pull to refresh or try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImageAsBase64 = async () => {
    try {
      const ImagePicker = (await import('expo-image-picker')).default || (await import('expo-image-picker'));
      const status = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status.status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photo library.');
        return null;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
      });
      if (result.canceled) return null;
      const asset = result.assets && result.assets[0];
      if (!asset?.base64) return null;
      // Try to preserve mime
      const mime = asset.type === 'image' ? 'image/jpeg' : 'application/octet-stream';
      return `data:${mime};base64,${asset.base64}`;
    } catch (e) {
      Alert.alert('Error', 'Unable to pick image.');
      return null;
    }
  };

  const pickProfilePhoto = async () => {
    const b64 = await pickImageAsBase64();
    if (!b64) return;
    setPendingUploads(prev => ({ ...prev, profile_image_base64: b64 }));
  };

  const pickLicenseFront = async () => {
    const b64 = await pickImageAsBase64();
    if (!b64) return;
    setPendingUploads(prev => ({ ...prev, license_base64: b64 }));
  };

  const pickLicenseBack = async () => {
    const b64 = await pickImageAsBase64();
    if (!b64) return;
    setPendingUploads(prev => ({ ...prev, license_back_base64: b64 }));
  };

  const pickInsurance = async () => {
    const b64 = await pickImageAsBase64();
    if (!b64) return;
    setPendingUploads(prev => ({ ...prev, insurance_doc_base64: b64 }));
  };

  const handleSave = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to update your profile.');
      return;
    }

    try {
      setLoading(true);
      // If any base64 uploads were made, send to upload helper
      if (pendingUploads.profile_image_base64 || pendingUploads.license_base64 || pendingUploads.license_back_base64) {
        await fetch(`${API_BASE_URL}/users/${user.id}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pendingUploads)
        }).then(r => r.json()).then(d => {
          if (d.success) {
            formData.profile_image = d.data.profile_image_url || formData.profile_image;
            formData.license_front = d.data.license_front_url || formData.license_front;
            formData.license_back = d.data.license_back_url || formData.license_back;
          }
        });
      }
      const res = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          id_number: formData.id_number,
          profile_image: formData.profile_image,
          license_front: formData.license_front,
          license_back: formData.license_back,
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update profile');
      Alert.alert('Success', 'Profile updated successfully!', [{ text: 'OK', onPress: () => {
        router.back();
      } }]);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Save a single field immediately when the user finishes editing
  const saveSingleField = async (fieldKey) => {
    try {
      if (!user?.id) return;
      const body = { [fieldKey]: formData[fieldKey] };
      await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
    } catch (e) {
      // Silent fail for per-field saves to avoid noisy UX
      console.warn('Field save failed:', fieldKey, e.message);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, ]}>
        <Pressable onPress={handleCancel} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} refreshControl={undefined}>
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Pressable onPress={pickProfilePhoto} accessibilityRole="button" accessibilityLabel="Change profile photo">
              <Image 
                source={{ 
                  uri: resolveUrl(formData.profile_image) || 'https://i.pravatar.cc/200?img=12' 
                }} 
                style={styles.profileImage} 
              />
            </Pressable>
          </View>
          <Text style={styles.imageText}>Tap your photo to change</Text>
        </View>

        {!!loadError && (
          <View style={[styles.section, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }] }>
            <Text style={{ color: '#B91C1C' }}>{loadError}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <View style={styles.inputRow}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.first_name}
                onChangeText={(text) => handleInputChange('first_name', text)}
                onBlur={() => saveSingleField('first_name')}
                placeholder="Enter first name"
                placeholderTextColor={colors.slate}
              />
            </View>
            <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.last_name}
                onChangeText={(text) => handleInputChange('last_name', text)}
                onBlur={() => saveSingleField('last_name')}
                placeholder="Enter last name"
                placeholderTextColor={colors.slate}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              onBlur={() => saveSingleField('email')}
              placeholder="Enter email address"
              placeholderTextColor={colors.slate}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Removed phone number and date of birth fields as requested */}
        </View>

        {/* Emergency Contact section removed per request */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diving Information</Text>
          
          <View style={styles.uploadRow}>
            <View style={[styles.uploadBox, { marginRight: 8 }]}>
              <Text style={styles.inputLabel}>Diving License Front</Text>
              <Pressable style={styles.uploadBoxInner} onPress={pickLicenseFront}> 
                <Ionicons name="document" size={20} color={colors.ocean} />
                <Text style={styles.uploadBoxText}>{formData.license_front ? 'Replace file' : 'Tap to upload'}</Text>
              </Pressable>
              {formData.license_front ? (
                <Text style={styles.fileHint}>Uploaded</Text>
              ) : (
                <Text style={styles.fileHint}>No file</Text>
              )}
            </View>
            <View style={[styles.uploadBox, { marginLeft: 8 }]}>
              <Text style={styles.inputLabel}>Diving License Back</Text>
              <Pressable style={styles.uploadBoxInner} onPress={pickLicenseBack}> 
                <Ionicons name="document-text" size={20} color={colors.ocean} />
                <Text style={styles.uploadBoxText}>{formData.license_back ? 'Replace file' : 'Tap to upload'}</Text>
              </Pressable>
              {formData.license_back ? (
                <Text style={styles.fileHint}>Uploaded</Text>
              ) : (
                <Text style={styles.fileHint}>No file</Text>
              )}
            </View>
          </View>

          <View style={[styles.uploadBox, { marginTop: 12 }]}>
            <Text style={styles.inputLabel}>Insurance</Text>
            <Pressable style={styles.uploadBoxInner} onPress={pickInsurance}> 
              <Ionicons name="shield-checkmark" size={20} color={colors.ocean} />
              <Text style={styles.uploadBoxText}>{formData.insurance_url ? 'Replace file' : 'Tap to upload'}</Text>
            </Pressable>
            {formData.insurance_url ? (
              <Text style={styles.fileHint}>Uploaded</Text>
            ) : (
              <Text style={styles.fileHint}>No file</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonSection}>
          <Pressable 
            style={[styles.cancelButton, loading && styles.buttonDisabled]} 
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.saveButtonLarge, loading && styles.buttonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={colors.white} />
                <Text style={styles.saveButtonTextLarge}>Save Changes</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E6EAF2', margin: 16, marginBottom: 12 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.ink, position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  saveButton: { backgroundColor: colors.ocean, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: '600' },
  scrollContainer: { flex: 1 },
  imageSection: { backgroundColor: colors.white, margin: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  imageContainer: { position: 'relative', marginBottom: 8 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: colors.ocean },
  imageText: { fontSize: 14, color: colors.slate },
  section: { backgroundColor: colors.white, marginHorizontal: 16, marginBottom: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 16 },
  inputRow: { flexDirection: 'row', marginBottom: 16 },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.ink, marginBottom: 8 },
  input: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: colors.ink },
  buttonSection: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 32, gap: 12 },
  cancelButton: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { color: colors.slate, fontSize: 16, fontWeight: '600' },
  saveButtonLarge: { flex: 2, backgroundColor: colors.ocean, paddingVertical: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveButtonTextLarge: { color: colors.white, fontSize: 16, fontWeight: '600' },
  buttonDisabled: { opacity: 0.6 },
  uploadRow: { flexDirection: 'row' },
  uploadBox: { flex: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12 },
  uploadBoxInner: { marginTop: 6, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 18, alignItems: 'center', justifyContent: 'center' },
  uploadBoxText: { color: colors.slate, marginTop: 6 },
  uploadButton: { backgroundColor: colors.ocean, paddingVertical: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 6 },
  uploadButtonText: { color: colors.white, fontWeight: '600', marginLeft: 6 },
  fileHint: { marginTop: 6, fontSize: 12, color: colors.slate }
});


