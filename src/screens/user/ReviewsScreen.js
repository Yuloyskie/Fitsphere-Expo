import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Image, ScrollView, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchProductById, submitReview, updateReview, deleteReview } from '../../store/slices/productSlice';
import { Ionicons } from '@expo/vector-icons';

export default function ReviewsScreen({ route }) {
  const { productId } = route.params;
  const dispatch = useDispatch();
  const product = useSelector(state => state.products.selectedProduct);
  const user = useSelector(state => state.auth.user);
  const orders = useSelector(state => state.orders.orders);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  // Refetch reviews whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchProductById(productId));
    }, [dispatch, productId])
  );

  const reviews = product?.reviews || [];
  const hasVerifiedPurchase = orders.some(order =>
    order.status === 'delivered' &&
    order.items?.some(item => item.product.id === productId) &&
    order.userId === (user?.id || 'guest')
  );

  const resetForm = () => {
    setComment('');
    setRating(5);
    setEditingReviewId(null);
    setShowReviewForm(false);
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a review');
      return;
    }

    if (!hasVerifiedPurchase && !editingReviewId) {
      Alert.alert('Verified purchase required', 'You can only review products from delivered orders.');
      return;
    }

    const reviewPayload = {
      userId: user?.id || 'guest',
      userName: user?.fullName || user?.name || 'Anonymous User',
      userProfileImage: user?.profileImage || null,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    try {
      if (editingReviewId) {
        await dispatch(updateReview({
          productId,
          reviewId: editingReviewId,
          userId: user?.id,
          rating,
          comment,
        })).unwrap();
        Alert.alert('Success', 'Review updated successfully');
      } else {
        await dispatch(submitReview({ productId, review: reviewPayload })).unwrap();
        Alert.alert('Success', 'Thank you for your review!');
      }
      resetForm();
    } catch (error) {
      Alert.alert('Error', 'Unable to save your review right now.');
    }
  };

  const handleEditReview = (review) => {
    setRating(review.rating);
    setComment(review.comment);
    setEditingReviewId(review.id);
    setShowReviewForm(true);
  };

  const handleDeleteOwnReview = (reviewId) => {
    Alert.alert('Delete Review', 'Are you sure you want to delete this review?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteReview({ productId, reviewId, userId: user?.id })).unwrap();
            Alert.alert('Success', 'Review deleted');
          } catch (error) {
            Alert.alert('Error', 'Unable to delete review right now.');
          }
        },
      },
    ]);
  };

  const handleReportReview = (reviewId) => {
    Alert.alert(
      'Report Review',
      'Are you sure you want to report this review as inappropriate?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Report', style: 'destructive', onPress: () => {
          Alert.alert('Reported', 'Thank you. We will review this report.');
        }},
      ]
    );
  };

  const renderStars = (itemRating, interactive = false) => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => interactive && setRating(star)}
          disabled={!interactive}
        >
          <Ionicons
            name={star <= itemRating ? 'star' : 'star-outline'}
            size={interactive ? 30 : 16}
            color={star <= itemRating ? '#FFD700' : '#ddd'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderReviewItem = ({ item }) => {
    const isOwnReview = item.userId === user?.id;

    const handleImagePress = (images) => {
      setGalleryImages(images);
      setShowImageGallery(true);
    };

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            {item.userProfileImage ? (
              <Image source={{ uri: item.userProfileImage }} style={styles.reviewerAvatar} />
            ) : (
              <View style={styles.reviewerAvatar}>
                <Text style={styles.reviewerInitial}>{(item.userName || 'U').charAt(0)}</Text>
              </View>
            )}
            <View>
              <Text style={styles.reviewerName}>{item.userName || 'Anonymous'}</Text>
              <Text style={styles.reviewDate}>{formatDate(item.updatedAt || item.createdAt || item.date)}</Text>
            </View>
          </View>
          {renderStars(item.rating)}
        </View>
        <Text style={styles.reviewComment}>{item.comment}</Text>
        
        {item.images && item.images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.reviewImagesContainer}
          >
            {item.images.map((image, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleImagePress(item.images)}
                style={styles.reviewImageWrapper}
              >
                <Image source={{ uri: image }} style={styles.reviewImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        <View style={styles.reviewActions}>
          {isOwnReview ? (
            <>
              <TouchableOpacity style={styles.reportButton} onPress={() => handleEditReview(item)}>
                <Ionicons name="create-outline" size={14} color="#555" />
                <Text style={styles.reportText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.reportButton} onPress={() => handleDeleteOwnReview(item.id)}>
                <Ionicons name="trash-outline" size={14} color="#b00020" />
                <Text style={[styles.reportText, styles.deleteText]}>Delete</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.reportButton} onPress={() => handleReportReview(item.id)}>
              <Ionicons name="flag-outline" size={14} color="#999" />
              <Text style={styles.reportText}>Report</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.averageRating}>{averageRating}</Text>
        {renderStars(Math.round(Number(averageRating)))}
        <Text style={styles.totalReviews}>{reviews.length} reviews</Text>
        {!hasVerifiedPurchase && (
          <Text style={styles.helperText}>Reviews are available after a delivered purchase.</Text>
        )}
      </View>

      {!showReviewForm ? (
        <TouchableOpacity
          style={[styles.writeReviewButton, !hasVerifiedPurchase && styles.disabledButton]}
          onPress={() => setShowReviewForm(true)}
          disabled={!hasVerifiedPurchase}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.writeReviewText}>Write a Review</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.reviewForm}>
          <Text style={styles.formTitle}>{editingReviewId ? 'Update Your Review' : 'Write Your Review'}</Text>

          <Text style={styles.label}>Rating</Text>
          {renderStars(rating, true)}

          <Text style={styles.label}>Your Review</Text>
          <TextInput
            style={styles.reviewInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience with this product..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReview}>
              <Text style={styles.submitButtonText}>{editingReviewId ? 'Update' : 'Submit'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <FlatList
        data={reviews}
        renderItem={renderReviewItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={50} color="#ddd" />
            <Text style={styles.emptyText}>No reviews yet</Text>
            <Text style={styles.emptySubtext}>Be the first verified buyer to review this product</Text>
          </View>
        }
      />

      <Modal
        visible={showImageGallery}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageGallery(false)}
      >
        <View style={styles.galleryContainer}>
          <TouchableOpacity
            style={styles.galleryCloseButton}
            onPress={() => setShowImageGallery(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            style={styles.galleryScroll}
            contentContainerStyle={styles.galleryContent}
          >
            {galleryImages.map((image, idx) => (
              <View key={idx} style={styles.galleryImageContainer}>
                <Image source={{ uri: image }} style={styles.galleryImage} />
              </View>
            ))}
          </ScrollView>
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
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333333',
  },
  starsContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  totalReviews: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
  },
  writeReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  writeReviewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reviewForm: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 15,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333333',
    minHeight: 100,
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    color: '#666',
  },
  submitButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
  },
  reviewCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  reviewerInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 10,
  },
  reviewImagesContainer: {
    marginvertical: 10,
    marginBottom: 10,
  },
  reviewImageWrapper: {
    marginRight: 10,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  reviewActions: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  reportText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  deleteText: {
    color: '#b00020',
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  galleryCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  galleryScroll: {
    flex: 1,
  },
  galleryContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryImageContainer: {
    width: null,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
});
