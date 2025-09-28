import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Platform, StatusBar, Linking, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function ClubDetail() {
  const router = useRouter();
  const { club: clubParam } = useLocalSearchParams();
  const { user, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    user_name: '',
    rating: 5,
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (clubParam) {
      try {
        const clubData = JSON.parse(clubParam);
        setClub(clubData);
        setLoading(false);
        
        // Auto-fill user name if logged in
        if (isAuthenticated && user) {
          const userName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}`
            : user.email || 'Anonymous';
          setReviewForm(prev => ({ ...prev, user_name: userName }));
        }
        
        // Fetch reviews for this club
        fetchReviews(clubData.club_id);
      } catch (err) {
        setError('Invalid club data');
        setLoading(false);
      }
    } else {
      setError('No club data provided');
      setLoading(false);
    }
  }, [clubParam, isAuthenticated, user]);

  const fetchReviews = async (clubId) => {
    try {
      setLoadingReviews(true);
      const response = await fetch(`${API_BASE_URL}/dive-clubs/${clubId}/reviews`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (error) {
      return dateString;
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (email) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleWebsite = (website) => {
    if (website && website !== 'none' && website !== '') {
      let url = website;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      Linking.openURL(url);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.user_name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!reviewForm.comment.trim()) {
      Alert.alert('Error', 'Please write a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      
      const response = await fetch(`${API_BASE_URL}/dive-clubs/${club.club_id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_name: reviewForm.user_name.trim(),
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Your review has been submitted!', [
          {
            text: 'OK',
            onPress: () => {
              setShowReviewForm(false);
              setReviewForm({
                user_name: isAuthenticated && user ? 
                  (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email || 'Anonymous') 
                  : '',
                rating: 5,
                comment: ''
              });
              // Refresh reviews list
              fetchReviews(club.club_id);
            }
          }
        ]);
      } else {
        Alert.alert('Error', data.error || 'Failed to submit review');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error: ' + error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color={colors.warning} />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color={colors.warning} />
      );
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={16} color={colors.border} />
      );
    }
    
    return (
      <View style={styles.ratingContainer}>
        <View style={styles.starsContainer}>
          {stars}
        </View>
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Club Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.ocean} />
          <Text style={styles.loadingText}>Loading dive club...</Text>
        </View>
      </View>
    );
  }

  if (error || !club) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>Dive Club Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>Failed to load dive club</Text>
          <Text style={styles.errorSubtext}>{error || 'Club not found'}</Text>
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
        <Text style={styles.headerTitle}>Dive Club Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Club Header */}
        <View style={styles.clubHeader}>
          <View style={styles.clubIcon}>
            <Ionicons name="people" size={32} color={colors.ocean} />
          </View>
          <View style={styles.clubInfo}>
            <Text style={styles.clubName}>{club.name}</Text>
            <Text style={styles.clubLocation}>{club.location}</Text>
            {club.rating && renderStars(club.rating)}
          </View>
        </View>

        {/* Club Image */}
        {club.image_url && (
          <View style={styles.imageContainer}>
            <View style={styles.clubImage} />
          </View>
        )}

        {/* Description */}
        {club.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About This Club</Text>
            <Text style={styles.description}>{club.description}</Text>
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          
          {club.contact_phone && (
            <Pressable style={styles.contactItem} onPress={() => handleCall(club.contact_phone)}>
              <View style={styles.contactIcon}>
                <Ionicons name="call" size={20} color={colors.ocean} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{club.contact_phone}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.slate} />
            </Pressable>
          )}

          {club.contact_email && (
            <Pressable style={styles.contactItem} onPress={() => handleEmail(club.contact_email)}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={20} color={colors.ocean} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{club.contact_email}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.slate} />
            </Pressable>
          )}

          {club.website && club.website !== 'none' && club.website !== '' && (
            <Pressable style={styles.contactItem} onPress={() => handleWebsite(club.website)}>
              <View style={styles.contactIcon}>
                <Ionicons name="globe" size={20} color={colors.ocean} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Website</Text>
                <Text style={styles.contactValue}>{club.website}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.slate} />
            </Pressable>
          )}
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Club Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{club.location}</Text>
          </View>
          {club.created_at && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Established</Text>
              <Text style={styles.detailValue}>
                {new Date(club.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>

        {/* Write Review Section */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            {!showReviewForm && (
              <Pressable 
                style={styles.addReviewButton} 
                onPress={() => setShowReviewForm(true)}
              >
                <Ionicons name="add" size={16} color={colors.white} />
                <Text style={styles.addReviewButtonText}>Add Review</Text>
              </Pressable>
            )}
          </View>
          
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
                  onPress={() => {
                    setShowReviewForm(false);
                    setReviewForm({
                      user_name: isAuthenticated && user ? 
                        (user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email || 'Anonymous') 
                        : '',
                      rating: 5,
                      comment: ''
                    });
                  }}
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
          {!showReviewForm && reviews && Array.isArray(reviews) && reviews.length > 0 ? (
            <>
              <Text style={styles.reviewsSubtitle}>Latest Reviews ({reviews.length})</Text>
              {reviews.slice(0, 5).map((review) => (
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
              {reviews.length > 5 && (
                <Text style={styles.moreReviewsText}>
                  Showing latest 5 of {reviews.length} reviews
                </Text>
              )}
            </>
          ) : !showReviewForm && (
            <View style={styles.noReviewsContainer}>
              <Ionicons name="chatbubbles-outline" size={32} color={colors.slate} />
              <Text style={styles.noReviewsText}>No reviews yet</Text>
              <Text style={styles.noReviewsSubtext}>Be the first to review this dive club!</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    marginTop: 12,
    fontSize: 16,
    color: colors.slate,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: colors.error,
  },
  errorSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: colors.slate,
    textAlign: 'center',
  },
  clubHeader: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 4,
  },
  clubLocation: {
    fontSize: 14,
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
    fontWeight: '600',
    color: colors.warning,
  },
  imageContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  clubImage: {
    width: '100%',
    height: 200,
    backgroundColor: colors.bg,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.slate,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.slate,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.slate,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addReviewButton: {
    backgroundColor: colors.ocean,
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
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: 12,
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
    backgroundColor: colors.ocean,
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
  reviewItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 12,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
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
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 12,
    color: colors.slate,
  },
  moreReviewsText: {
    fontSize: 12,
    color: colors.slate,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});
