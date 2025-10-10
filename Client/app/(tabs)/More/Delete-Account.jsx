import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { deleteAccount } from '../../../services/api';

export default function DeleteAccount() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [idNumber, setIdNumber] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    // Validation
    if (!idNumber.trim()) {
      Alert.alert('Error', 'Please enter your ID number');
      return;
    }

    if (idNumber.trim() !== user?.id_number) {
      Alert.alert('Error', 'ID number does not match your account');
      return;
    }

    if (confirmText.toLowerCase() !== 'delete') {
      Alert.alert('Error', 'Please type "delete" to confirm');
      return;
    }

    // Final confirmation
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteAccount(user.id, idNumber.trim());
              
              Alert.alert(
                'Account Deleted',
                'Your account has been permanently deleted.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      logout();
                      router.replace('/(auth)/login');
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Delete account error:', error);
              Alert.alert('Error', error.message || 'Failed to delete account. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Delete Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.warningCard}>
        <Ionicons name="warning" size={48} color="#E11D48" style={styles.warningIcon} />
        <Text style={styles.warningTitle}>Warning: This Action is Permanent</Text>
        <Text style={styles.warningText}>
          Deleting your account will permanently remove:
        </Text>
        <View style={styles.warningList}>
          <Text style={styles.warningItem}>• Your profile and personal information</Text>
          <Text style={styles.warningItem}>• All your dive logs and history</Text>
          <Text style={styles.warningItem}>• Your name from all reviews (they will become anonymous)</Text>
          <Text style={styles.warningItem}>• All associated personal data</Text>
        </View>
        <Text style={styles.warningFooter}>
          This action cannot be undone.
        </Text>
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#1F7A8C" />
          <Text style={styles.infoText}>
            Your reviews will be preserved anonymously to help the diving community.
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Confirm Account Deletion</Text>
        <Text style={styles.cardSubtitle}>
          To proceed, please verify your identity
        </Text>

        <Text style={styles.label}>ID Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your ID number"
          placeholderTextColor="#9CA3AF"
          value={idNumber}
          onChangeText={setIdNumber}
          keyboardType="number-pad"
          editable={!loading}
        />

        <Text style={styles.label}>Type "delete" to confirm</Text>
        <TextInput
          style={styles.input}
          placeholder='Type "delete"'
          placeholderTextColor="#9CA3AF"
          value={confirmText}
          onChangeText={setConfirmText}
          autoCapitalize="none"
          editable={!loading}
        />

        <TouchableOpacity 
          style={[styles.deleteButton, loading && styles.deleteButtonDisabled]} 
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          <Text style={styles.deleteButtonText}>
            {loading ? 'Deleting...' : 'Delete My Account'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F6F7FB' 
  },
  headerBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 8, 
    paddingVertical: 10, 
    borderRadius: 10, 
    borderWidth: 1, 
    borderColor: '#E6EAF2', 
    margin: 16, 
    marginBottom: 12 
  },
  backButton: { 
    padding: 6 
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#0B132B' 
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 20,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FCA5A5',
    alignItems: 'center'
  },
  warningIcon: {
    marginBottom: 12
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 12,
    textAlign: 'center'
  },
  warningText: {
    fontSize: 14,
    color: '#7F1D1D',
    marginBottom: 8,
    textAlign: 'center'
  },
  warningList: {
    alignSelf: 'stretch',
    marginVertical: 12
  },
  warningItem: {
    fontSize: 14,
    color: '#7F1D1D',
    marginVertical: 4
  },
  warningFooter: {
    fontSize: 14,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 8,
    textAlign: 'center'
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#075985',
    fontWeight: '500'
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    marginHorizontal: 16, 
    marginBottom: 12, 
    padding: 20, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: '#E6EAF2' 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0B132B', 
    marginBottom: 8 
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#515873',
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827'
  },
  deleteButton: {
    backgroundColor: '#E11D48',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24
  },
  deleteButtonDisabled: {
    backgroundColor: '#FCA5A5',
    opacity: 0.6
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  cancelButtonText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 16
  }
});

