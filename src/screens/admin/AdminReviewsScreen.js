import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import {
  fetchAllReviews,
  setReviewFilter,
  selectReview,
  clearSelectedReview,
  approveReview,
  rejectReview,
  flagReview,
  respondToReview,
} from '../../store/slices/reviewSlice';
import { Ionicons } from '@expo/vector-icons';

export default function AdminReviewsScreen() {
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews.allReviews);
  const selectedReview = useSelector(state => state.reviews.selectedReview);
  const filter = useSelector(state => state.reviews.filter);
  const loading = useSelector(state => state.reviews.loading);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchAllReviews());
    }, [dispatch])
  );

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      filter.status === 'all' ||
      (filter.status === 'pending' && !review.approved) ||
      (filter.status === 'approved' && review.approved) ||
      (filter.status === 'flagged' && review.flagged);

    const matchesRating = 
      filter.rating === 'all' ||
      review.rating === parseInt(filter.rating);

    return matchesSearch && matchesStatus && matchesRating;
  });

  const renderStars = (rating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color="#FFB81C"
          />
        ))}
      </View>
    );
  };

  const handleApproveReview = (review) => {
    Alert.alert(
      'Approve Review',
      `Approve review from ${review.userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => {
            dispatch(approveReview({
              productId: review.productId,
              reviewId: review.id,
            }));
            Alert.alert('Success', 'Review approved');
            setShowDetailModal(false);
          },
        },
      ]
    );
  };

  const handleRejectReview = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Error', 'Please enter a rejection reason');
      return;
    }

    dispatch(rejectReview({
      productId: selectedReview.productId,
      reviewId: selectedReview.id,
      reason: rejectionReason,
    }));
    Alert.alert('Success', 'Review rejected');
    setShowRejectModal(false);
    setRejectionReason('');
    setShowDetailModal(false);
  };

  const handleFlagReview = () => {
    Alert.alert(
      'Flag Review',
      'Mark this review as inappropriate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Flag',
          style: 'destructive',
          onPress: () => {
            dispatch(flagReview({
              productId: selectedReview.productId,
              reviewId: selectedReview.id,
              reason: 'Flagged by admin',
            }));
            Alert.alert('Success', 'Review flagged');
            setShowDetailModal(false);
          },
        },
      ]
    );
  };

  const handleRespondToReview = () => {
    if (!responseText.trim()) {
      Alert.alert('Error', 'Please enter your response');
      return;
    }

    dispatch(respondToReview({
      productId: selectedReview.productId,
      reviewId: selectedReview.id,
      response: responseText,
    }));
    Alert.alert('Success', 'Response posted');
    setShowResponseModal(false);
    setResponseText('');
  };

  const renderReviewItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reviewCard}
      onPress={() => {
        dispatch(selectReview(item));
        setShowDetailModal(true);
      }}
    >
      <View style={styles.reviewHeader}>
        <View>
          <Text style={styles.reviewerName}>{item.userName}</Text>
          {renderStars(item.rating)}
        </View>
        <View style={styles.statusBadges}>
          {item.approved && (
            <View style={[styles.badge, styles.approvedBadge]}>
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={styles.badgeText}>Approved</Text>
            </View>
          )}
          {!item.approved && !item.flagged && (
            <View style={[styles.badge, styles.pendingBadge]}>
              <Ionicons name="time" size={14} color="#fff" />
              <Text style={styles.badgeText}>Pending</Text>
            </View>
          )}
          {item.flagged && (
            <View style={[styles.badge, styles.flaggedBadge]}>
              <Ionicons name="flag" size={14} color="#fff" />
              <Text style={styles.badgeText}>Flagged</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.reviewComment} numberOfLines={2}>{item.comment}</Text>

      <View style={styles.reviewFooter}>
        <Text style={styles.reviewDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reviews..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />

        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Rating:</Text>
            <FlatList
              horizontal
              data={['all', '5', '4', '3', '2', '1']}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filter.rating === item && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    dispatch(setReviewFilter({ rating: item }))
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filter.rating === item && styles.filterChipTextActive,
                    ]}
                  >
                    {item === 'all' ? 'All' : `${item}★`}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item}
              scrollEnabled
              showsHorizontalScrollIndicator={false}
            />
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Status:</Text>
          <FlatList
            horizontal
            data={['all', 'pending', 'approved', 'flagged']}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filter.status === item && styles.filterChipActive,
                ]}
                onPress={() =>
                  dispatch(setReviewFilter({ status: item }))
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter.status === item && styles.filterChipTextActive,
                  ]}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={item => item}
            scrollEnabled
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>

      {/* Review List */}
      <FlatList
        data={filteredReviews}
        renderItem={renderReviewItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => dispatch(fetchAllReviews())}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={50} color="#ddd" />
            <Text style={styles.emptyText}>No reviews found</Text>
          </View>
        }
      />

      {/* Detail Modal */}
      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Review Details</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDetailModal(false);
                  dispatch(clearSelectedReview());
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedReview && (
              <ScrollView style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Reviewer</Text>
                  <Text style={styles.sectionText}>{selectedReview.userName}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Rating</Text>
                  {renderStars(selectedReview.rating)}
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Review</Text>
                  <Text style={styles.sectionText}>{selectedReview.comment}</Text>
                </View>

                {selectedReview.sellerResponse && (
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Seller Response</Text>
                    <View style={styles.responseBox}>
                      <Text style={styles.sectionText}>{selectedReview.sellerResponse}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Status</Text>
                  <View style={styles.statusBadges}>
                    {selectedReview.approved && (
                      <View style={[styles.badge, styles.approvedBadge]}>
                        <Text style={styles.badgeText}>Approved</Text>
                      </View>
                    )}
                    {selectedReview.flagged && (
                      <View style={[styles.badge, styles.flaggedBadge]}>
                        <Text style={styles.badgeText}>Flagged</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.actionButtons}>
                  {!selectedReview.approved && !selectedReview.flagged && (
                    <>
                      <TouchableOpacity
                        style={[styles.button, styles.approveButton]}
                        onPress={() => handleApproveReview(selectedReview)}
                      >
                        <Ionicons name="checkmark" size={18} color="#fff" />
                        <Text style={styles.buttonText}>Approve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.rejectButton]}
                        onPress={() => setShowRejectModal(true)}
                      >
                        <Ionicons name="close" size={18} color="#fff" />
                        <Text style={styles.buttonText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity
                    style={[styles.button, styles.responseButton]}
                    onPress={() => setShowResponseModal(true)}
                  >
                    <Ionicons name="chatbubble" size={18} color="#fff" />
                    <Text style={styles.buttonText}>Response</Text>
                  </TouchableOpacity>

                  {!selectedReview.flagged && (
                    <TouchableOpacity
                      style={[styles.button, styles.flagButton]}
                      onPress={handleFlagReview}
                    >
                      <Ionicons name="flag" size={18} color="#fff" />
                      <Text style={styles.buttonText}>Flag</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Response Modal */}
      <Modal visible={showResponseModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.responseModal}>
            <Text style={styles.modalTitle}>Respond to Review</Text>

            <TextInput
              style={styles.responseInput}
              placeholder="Write your response..."
              value={responseText}
              onChangeText={setResponseText}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />

            <View style={styles.responseActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowResponseModal(false);
                  setResponseText('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleRespondToReview}
              >
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.responseModal}>
            <Text style={styles.modalTitle}>Reject Review</Text>

            <TextInput
              style={styles.responseInput}
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />

            <View style={styles.responseActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleRejectReview}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 14,
    color: '#333',
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  filterGroup: {
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#4B5563',
    borderColor: '#4B5563',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 10,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FFB81C',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  statusBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  approvedBadge: {
    backgroundColor: '#10b981',
  },
  pendingBadge: {
    backgroundColor: '#FFB81C',
  },
  flaggedBadge: {
    backgroundColor: '#f44336',
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  reviewComment: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewDate: {
    fontSize: 11,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  detailModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  responseBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  responseModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '50%',
  },
  responseInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 15,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    marginTop: 20,
  },
  responseActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#f44336',
  },
  responseButton: {
    backgroundColor: '#2196F3',
  },
  flagButton: {
    backgroundColor: '#FF8C42',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#999',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4B5563',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
