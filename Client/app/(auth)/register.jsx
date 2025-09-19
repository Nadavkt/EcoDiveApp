import 'react-native-get-random-values';
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import bcrypt from 'bcryptjs';
import { saveUser, sendRegistrationEmail } from '../../services/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export default function Register() {
  const router = useRouter();
  const scrollRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    idNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);
  const [insuranceConfirmation, setInsuranceConfirmation] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const requestMediaPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to continue.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const ok = await requestMediaPermission();
    if (!ok) return null;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });
    if (res.canceled) return null;
    const asset = res.assets && res.assets[0];
    return asset?.uri || null;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your camera to continue.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const ok = await requestCameraPermission();
    if (!ok) return null;
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8
    });
    if (res.canceled) return null;
    const asset = res.assets && res.assets[0];
    return asset?.uri || null;
  };

  const pickDocument = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      multiple: false,
      copyToCacheDirectory: true
    });
    if (res.canceled) return null;
    const file = res.assets && res.assets[0];
    return file?.uri || null;
  };

  const isImageUri = (uri) => typeof uri === 'string' && /(\.png|\.jpg|\.jpeg|\.heic|\.webp)$/i.test(uri);

  const handleImageUpload = async (type) => {
    try {
      const chooseAndSet = async (setter) => {
        Alert.alert(
          'Select source',
          'Choose how to upload the image',
          [
            { text: 'Camera', onPress: async () => { const uri = await takePhoto(); if (uri) setter(uri); } },
            { text: 'Photo Library', onPress: async () => { const uri = await pickImage(); if (uri) setter(uri); } },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      };

      if (type === 'Profile') return chooseAndSet(setProfileImage);
      if (type === 'License Front') return chooseAndSet(setLicenseFront);
      if (type === 'License Back') return chooseAndSet(setLicenseBack);
      if (type === 'Insurance Confirmation') {
        Alert.alert(
          'Select source',
          'Choose how to upload confirmation',
          [
            { text: 'Photo Library', onPress: async () => { const uri = await pickImage(); if (uri) setInsuranceConfirmation(uri); } },
            { text: 'Files (PDF/Image)', onPress: async () => { const uri = await pickDocument(); if (uri) setInsuranceConfirmation(uri); } },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Upload failed', 'Could not select the file. Please try again.');
    }
  };

  const scrollToEnd = () => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const onRegister = async () => {
    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.idNumber || !formData.password || !formData.confirmPassword) {
        Alert.alert('Missing fields', 'Please complete all required fields.');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert('Password mismatch', 'Passwords do not match.');
        return;
      }

      // 1-2) Hash password and save user (excluding insurance confirmation file) to DB
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(formData.password, salt);

      const userPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        idNumber: formData.idNumber,
        passwordHash,
        // send references/URIs of images as metadata if backend supports it
        profileImage: profileImage || null,
        licenseFront: licenseFront || null,
        licenseBack: licenseBack || null
      };

      // Save user to database
      const saved = await saveUser(userPayload);

      // 3) Send email with all data INCLUDING images/files
      try {
        console.log('Sending registration email...');
        const toEmail = process.env.EXPO_PUBLIC_REGISTRATION_EMAIL || 'ecodive09@gmail.com';
        await sendRegistrationEmail({
          fields: {
            ...userPayload,
            insuranceConfirmationIncluded: Boolean(insuranceConfirmation),
            toEmail
          },
          files: {
            profileImage: profileImage ? { uri: profileImage } : null,
            licenseFront: licenseFront ? { uri: licenseFront } : null,
            licenseBack: licenseBack ? { uri: licenseBack } : null,
            insuranceConfirmation: insuranceConfirmation ? { uri: insuranceConfirmation } : null
          }
        });
        console.log('Email sent successfully!');
        
        // 4) Success -> brief message then navigate to home
        Alert.alert('Success', 'Registered successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
        ]);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Still show success since user was created
        Alert.alert('Registration Complete', 'User created successfully! (Email may have failed)', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
        ]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Registration failed', err.message || 'Please try again later.');
    }
  };

  const onBackToLogin = () => {
    router.back();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}>
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.centerContent}>
        <Text style={styles.title}>Create your{`\n`}account</Text>
        <Text style={styles.subtitle}>Join EcoDive and start tracking your dives</Text>

        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>Profile Image</Text>
          <TouchableOpacity style={styles.imageUploadBtn} onPress={() => handleImageUpload('Profile')}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.uploadedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={24} color="#9CA3AF" />
                <Text style={styles.uploadText}>Add Photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* License Images Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>Diving License</Text>
          <View style={styles.licenseRow}>
            <TouchableOpacity style={styles.licenseUploadBtn} onPress={() => handleImageUpload('License Front')}>
              {licenseFront ? (
                <Image source={{ uri: licenseFront }} style={styles.licenseImage} />
              ) : (
                <View style={styles.licensePlaceholder}>
                  <Ionicons name="document" size={20} color="#9CA3AF" />
                  <Text style={styles.licenseText}>Front</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.licenseUploadBtn} onPress={() => handleImageUpload('License Back')}>
              {licenseBack ? (
                <Image source={{ uri: licenseBack }} style={styles.licenseImage} />
              ) : (
                <View style={styles.licensePlaceholder}>
                  <Ionicons name="document" size={20} color="#9CA3AF" />
                  <Text style={styles.licenseText}>Back</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Insurance Confirmation */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>Insurance Confirmation</Text>
          <TouchableOpacity style={styles.licenseUploadBtn} onPress={() => handleImageUpload('Insurance Confirmation')}>
            {insuranceConfirmation ? (
              isImageUri(insuranceConfirmation) ? (
                <Image source={{ uri: insuranceConfirmation }} style={styles.licenseImage} />
              ) : (
                <View style={styles.licensePlaceholder}>
                  <Ionicons name="document-text" size={20} color="#9CA3AF" />
                  <Text style={styles.licenseText}>File attached</Text>
                </View>
              )
            ) : (
              <View style={styles.licensePlaceholder}>
                <Ionicons name="document-text" size={20} color="#9CA3AF" />
                <Text style={styles.licenseText}>Upload Confirmation</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Personal Information */}
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="First Name"
            placeholderTextColor="#9CA3AF"
            value={formData.firstName}
            onChangeText={(value) => handleInputChange('firstName', value)}
          />
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Last Name"
            placeholderTextColor="#9CA3AF"
            value={formData.lastName}
            onChangeText={(value) => handleInputChange('lastName', value)}
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9CA3AF"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="ID Number"
          placeholderTextColor="#9CA3AF"
          value={formData.idNumber}
          onChangeText={(value) => handleInputChange('idNumber', value)}
          keyboardType="number-pad"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={formData.password}
          onChangeText={(value) => handleInputChange('password', value)}
          onFocus={scrollToEnd}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
          onFocus={scrollToEnd}
          secureTextEntry
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={onRegister}>
          <Text style={styles.primaryText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onBackToLogin}>
          <Text style={styles.secondaryText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40
  },
  centerContent: {
    justifyContent: 'center'
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 34
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 14,
    marginBottom: 28
  },
  imageSection: {
    marginTop: 20,
    marginBottom: 10
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12
  },
  imageUploadBtn: {
    alignSelf: 'center',
    marginBottom: 10
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  uploadText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
  },
  licenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  licenseUploadBtn: {
    flex: 1
  },
  licensePlaceholder: {
    height: 80,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  licenseImage: {
    width: '100%',
    height: 80,
    borderRadius: 12
  },
  licenseText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginTop: 18
  },
  halfInput: {
    flex: 1,
    marginTop: 0
  },
  primaryBtn: {
    backgroundColor: '#4cc5ff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 26
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  secondaryText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 16
  }
});
