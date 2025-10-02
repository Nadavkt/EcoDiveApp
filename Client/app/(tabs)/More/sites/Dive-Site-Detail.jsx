import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, ActivityIndicator, Platform, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  bg: '#F6F7FB',
  white: '#FFFFFF',
  slate: '#515873',
  ink: '#0B132B',
  border: '#E6EAF2',
  ocean: '#1F7A8C',
  foam: '#4cc5ff',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444'
};

export default function DiveSiteDetail() {
  const router = useRouter();
  const { site: siteParam } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    user_name: '',
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (siteParam) {
      try {
        const siteData = JSON.parse(siteParam);
        setSite(siteData);
        setLoading(false);
        
        // Fetch detailed site information with reviews
        if (siteData.site_id) {
          fetchSiteDetails(siteData.site_id);
        }
      } catch (err) {
        setError('Invalid site data');
        setLoading(false);
      }
    }
  }, [siteParam]);

  // Auto-fill user name when user is logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'Anonymous';
      setReviewForm(prev => ({
        ...prev,
        user_name: userName
      }));
    }
  }, [isAuthenticated, user]);

  const fetchSiteDetails = async (siteId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/dive-sites/${siteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dive site details');
      }
      const data = await response.json();
      setSite(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dive site details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.user_name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await fetch(`${API_BASE_URL}/dive-sites/${site.site_id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewForm),
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      const newReview = await response.json();
      
      // Add the new review to the site's reviews
      setSite(prevSite => ({
        ...prevSite,
        reviews: [newReview, ...(prevSite.reviews || [])],
        review_count: (prevSite.review_count || 0) + 1
      }));

      // Reset form
      setReviewForm({
        user_name: '',
        rating: 5,
        comment: ''
      });
      setShowReviewForm(false);

      Alert.alert('Success', 'Your review has been submitted!');
    } catch (err) {
      Alert.alert('Error', err.message);
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating, size = 16) => {
    const stars = [];
    const safeRating = Math.max(0, Math.min(5, rating || 0));
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= safeRating ? 'star' : 'star-outline'}
          size={size}
          color={i <= safeRating ? '#F59E0B' : '#D1D5DB'}
        />
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Site Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ocean} />
          <Text style={styles.loadingText}>Loading dive site...</Text>
        </View>
      </View>
    );
  }

  if (error || !site) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Site Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>Failed to load dive site</Text>
          <Text style={styles.errorSubtext}>{error || 'Site not found'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>Dive Site Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Site Header */}
        <View style={styles.siteHeader}>
          <View style={styles.siteIcon}>
            <Ionicons name="location" size={32} color={colors.foam} />
          </View>
          <View style={styles.siteInfo}>
            <Text style={styles.siteName}>{site.name}</Text>
            <Text style={styles.siteLocation}>{site.location}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars(Math.round(site.average_rating || 0))}
              </View>
              <Text style={styles.ratingText}>
                {site.average_rating ? site.average_rating.toFixed(1) : 'No rating'} 
                ({site.review_count || 0} reviews)
              </Text>
            </View>
          </View>
        </View>

        {/* Site Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Description</Text>
          <Text style={styles.descriptionText}>{site.description || 'No description available.'}</Text>
        </View>

        {/* Location Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location Details</Text>
          <View style={styles.locationRow}>
            <Ionicons name="map-outline" size={20} color={colors.slate} />
            <Text style={styles.locationText}>{site.location}</Text>
          </View>
        </View>

        {/* Dive Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Dive Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="water-outline" size={20} color={colors.foam} />
              <Text style={styles.infoLabel}>Water Type</Text>
              <Text style={styles.infoValue}>
                {site.location.includes('Red Sea') ? 'Red Sea' : 
                 site.location.includes('Mediterranean') ? 'Mediterranean Sea' : 'Unknown'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="thermometer-outline" size={20} color={colors.foam} />
              <Text style={styles.infoLabel}>Temperature</Text>
              <Text style={styles.infoValue}>
                {site.location.includes('Red Sea') ? '22-28°C' : 
                 site.location.includes('Mediterranean') ? '18-26°C' : 'Varies'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="eye-outline" size={20} color={colors.foam} />
              <Text style={styles.infoLabel}>Visibility</Text>
              <Text style={styles.infoValue}>
                {site.location.includes('Red Sea') ? '15-30m' : 
                 site.location.includes('Mediterranean') ? '5-15m' : 'Varies'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color={colors.foam} />
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={styles.infoValue}>
                {site.description?.toLowerCase().includes('advanced') ? 'Advanced' :
                 site.description?.toLowerCase().includes('beginner') ? 'Beginner' : 'Intermediate'}
              </Text>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.card}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.cardTitle}>Reviews ({site.review_count || 0})</Text>
            <Pressable 
              style={styles.addReviewButton}
              onPress={() => setShowReviewForm(!showReviewForm)}
            >
              <Ionicons name="add" size={20} color={colors.white} />
              <Text style={styles.addReviewButtonText}>Add Review</Text>
            </Pressable>
          </View>

          {/* Review Form */}
          {showReviewForm && (
            <View style={styles.reviewForm}>
              <Text style={styles.formTitle}>Write a Review</Text>
              
              {!isAuthenticated && (
                <View style={styles.loginPrompt}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
                  <Text style={styles.loginPromptText}>
                    Log in to auto-fill your name and save your reviews
                  </Text>
                </View>
              )}
              
              <TextInput
                style={[styles.input, isAuthenticated && styles.disabledInput]}
                placeholder="Your name"
                value={reviewForm.user_name}
                onChangeText={(text) => setReviewForm(prev => ({ ...prev, user_name: text }))}
                placeholderTextColor={colors.slate}
                editable={!isAuthenticated}
              />
              {isAuthenticated && (
                <Text style={styles.autoFillText}>
                  ✓ Auto-filled with your account name
                </Text>
              )}

              <View style={styles.ratingSelector}>
                <Text style={styles.ratingLabel}>Rating:</Text>
                <View style={styles.starsSelector}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Pressable
                      key={star}
                      onPress={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                      style={styles.starButton}
                    >
                      <Ionicons
                        name={star <= reviewForm.rating ? 'star' : 'star-outline'}
                        size={24}
                        color={star <= reviewForm.rating ? '#F59E0B' : '#D1D5DB'}
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              <TextInput
                style={[styles.input, styles.commentInput]}
                placeholder="Your review (optional)"
                value={reviewForm.comment}
                onChangeText={(text) => setReviewForm(prev => ({ ...prev, comment: text }))}
                placeholderTextColor={colors.slate}
                multiline
                numberOfLines={3}
              />

              <View style={styles.formButtons}>
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => setShowReviewForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable 
                  style={[styles.submitButton, submittingReview && styles.submitButtonDisabled]}
                  onPress={handleSubmitReview}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {/* Reviews List */}
          {site.reviews && Array.isArray(site.reviews) && site.reviews.length > 0 ? (
            <>
              <Text style={styles.reviewsSubtitle}>Latest Reviews ({site.reviews.length})</Text>
              {site.reviews.slice(0, 5).map((review) => (
                <View key={review.review_id || Math.random()} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.user_name || 'Anonymous'}</Text>
                    <View style={styles.reviewRating}>
                      {renderStars(review.rating || 0, 14)}
                    </View>
                  </View>
                  {review.comment && (
                    <Text style={styles.reviewComment}>{review.comment}</Text>
                  )}
                  <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                </View>
              ))}
              {site.reviews.length > 5 && (
                <Text style={styles.moreReviewsText}>
                  Showing latest 5 of {site.reviews.length} reviews
                </Text>
              )}
            </>
          ) : (
            <View style={styles.noReviewsContainer}>
              <Ionicons name="chatbubbles-outline" size={32} color={colors.slate} />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>Be the first to review this dive site!</Text>
            </View>
          )}
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
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 8, 
    paddingVertical: 10, 
    borderRadius: 10, 
    borderWidth: 1, borderColor: '#E6EAF2', 
    margin: 16, marginBottom: 12
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.slate,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    color: colors.slate,
    marginTop: 8,
    textAlign: 'center',
  },
  siteHeader: {
    backgroundColor: colors.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  siteIcon: {
    width: 60,
    height: 60,
    backgroundColor: colors.bg,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  siteInfo: {
    flex: 1,
  },
  siteName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 4,
  },
  siteLocation: {
    fontSize: 16,
    color: colors.slate,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: colors.slate,
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
  descriptionText: {
    fontSize: 16,
    color: colors.slate,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: colors.slate,
    marginLeft: 8,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    backgroundColor: colors.bg,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: colors.slate,
    marginTop: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    marginTop: 2,
    textAlign: 'center',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addReviewButton: {
    backgroundColor: colors.foam,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addReviewButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewForm: {
    backgroundColor: colors.bg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 16,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 12,
  },
  commentInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: colors.bg,
    color: colors.slate,
  },
  autoFillText: {
    fontSize: 12,
    color: colors.success,
    marginTop: -8,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loginPromptText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  ratingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    color: colors.ink,
    marginRight: 12,
  },
  starsSelector: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 4,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.slate,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: colors.foam,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewComment: {
    fontSize: 14,
    color: colors.slate,
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.slate,
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noReviewsText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.slate,
    marginTop: 12,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: colors.slate,
    marginTop: 4,
    textAlign: 'center',
  },
  reviewsSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 12,
  },
  moreReviewsText: {
    fontSize: 12,
    color: colors.slate,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
