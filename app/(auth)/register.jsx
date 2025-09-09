import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Register() {
  const router = useRouter();
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

  const handleImageUpload = (type) => {
    // TODO: Implement actual image picker functionality
    Alert.alert('Image Upload', `${type} upload functionality will be implemented`);
  };

  const onRegister = () => {
    // TODO: implement registration logic with all form data
    console.log('Registration data:', { ...formData, profileImage, licenseFront, licenseBack, insuranceConfirmation });
    router.replace('/(auth)/login');
  };

  const onBackToLogin = () => {
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
              <Image source={{ uri: insuranceConfirmation }} style={styles.licenseImage} />
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
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#9CA3AF"
          value={formData.confirmPassword}
          onChangeText={(value) => handleInputChange('confirmPassword', value)}
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
