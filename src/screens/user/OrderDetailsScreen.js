import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert, Modal, TextInput, Rating } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { cancelOrder, updateOrderStatus } from '../../store/slices/orderSlice';
import { apiPost } from '../../services/api';
import { notificationService } from '../../services/NotificationService';

export default function OrderDetailsScreen({ route, navigation }) {
  const { orderId } = route.params;
  const order = useSelector(state => state.orders.orders.find(o => o.id === orderId));
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('details');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#FF9800';
      case 'shipped': return '#9C27B0';
      case 'delivered': return '#000000';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            await dispatch(cancelOrder(order.id)).unwrap();
            Alert.alert('Success', 'Your order has been cancelled.');
          },
        },
      ]
    );
  };

  const handleRequestReturn = () => {
    Alert.alert(
      'Request Return',
      'Would you like to request a return for this order?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => {
          Alert.alert('Success', 'Your return request has been submitted.');
        }},
      ]
    );
  };

  const handleReportIssue = () => {
    Alert.alert(
      'Report Issue',
      'What issue would you like to report?',
      [
        { text: 'Damaged Product', onPress: () => Alert.alert('Reported', 'We will investigate this issue.') },
        { text: 'Wrong Item Received', onPress: () => Alert.alert('Reported', 'We will investigate this issue.') },
        { text: 'Other', onPress: () => Alert.alert('Reported', 'We will investigate this issue.') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleMarkAsReceived = () => {
    Alert.alert(
      'Mark as Received',
      'Confirm that you have received this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Received',
          onPress: async () => {
            try {
              await dispatch(updateOrderStatus({ orderId: order.id, status: 'delivered' })).unwrap();
              
              // Send push notification
              await notificationService.sendLocalNotification(
                '✅ Order Delivered',
                `Your order #${order.id.slice(-6).toUpperCase()} has been marked as received. You can now leave a review!`,
                { orderId: order.id }
              );
              
              Alert.alert('Success', 'Order marked as received. Admin has been notified.');
            } catch (error) {
              Alert.alert('Error', 'Failed to update order status');
            }
          },
        },
      ]
    );
  };

  const handleTestNotification = async () => {
    await notificationService.sendLocalNotification(
      '📦 Test Notification',
      `Test: Order #${order.id.slice(-6).toUpperCase()}. Click to view order details!`,
      { orderId: order.id }
    );
  };

  const handleLeaveReview = () => {
    if (!order.items || order.items.length === 0) {
      Alert.alert('Error', 'No items in this order');
      return;
    }
    setSelectedProductIndex(0);
    setRating(5);
    setComment('');
    setSelectedImages([]);
    setShowReviewModal(true);
  };

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.IMAGE],
        allowsMultiple: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages = result.assets.slice(0, 5).map(asset => asset.uri);
        setSelectedImages([...selectedImages, ...newImages].slice(0, 5));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick images: ' + error.message);
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    if (rating < 1 || rating > 5) {
      Alert.alert('Error', 'Rating must be between 1 and 5');
      return;
    }

    try {
      const product = order.items[selectedProductIndex].product;
      await apiPost(`/products/${product.id}/reviews`, {
        userId: user.id,
        userName: user.fullName || user.name || 'Anonymous User',
        rating: Math.round(rating),
        comment: comment.trim(),
        orderId: order.id,
        images: selectedImages,
      });
      Alert.alert('Success', 'Your review has been submitted!');
      setShowReviewModal(false);
      setComment('');
      setRating(5);
      setSelectedImages([]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>



      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image source={{ uri: item.product.image }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.itemDetails}>Qty: {item.quantity} | Size: {item.size}</Text>
              <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{order.shippingInfo.fullName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{order.shippingInfo.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color="#666" />
          <Text style={styles.infoText}>{order.shippingInfo.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Information</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
        </View>
        {order.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount ({order.discount}%)</Text>
            <Text style={styles.summaryValueDiscount}>-${(order.subtotal * order.discount / 100).toFixed(2)}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total.toFixed(2)}</Text>
        </View>
      </View>

      {order.status === 'shipped' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.markReceivedButton} onPress={handleMarkAsReceived}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={styles.markReceivedButtonText}>Mark as Received</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.testNotificationButton} onPress={handleTestNotification}>
            <Ionicons name="notifications-outline" size={16} color="#fff" />
            <Text style={styles.testNotificationButtonText}>Test Alert</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'shipped' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
            <Ionicons name="close-circle-outline" size={20} color="#f44336" />
            <Text style={styles.cancelButtonText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'delivered' && (
        <View style={styles.deliveredActionsContainer}>
          <TouchableOpacity style={styles.reviewButton} onPress={handleLeaveReview}>
            <Ionicons name="star-outline" size={20} color="#fff" />
            <Text style={styles.reviewButtonText}>Leave Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.returnButton} onPress={handleRequestReturn}>
            <Ionicons name="refresh-outline" size={20} color="#000000" />
            <Text style={styles.returnButtonText}>Request Return</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
            <Ionicons name="alert-circle-outline" size={20} color="#FF9800" />
            <Text style={styles.reportButtonText}>Report Issue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Leave a Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {order.items && order.items.length > 0 && (
              <>
                {order.items.length > 1 && (
                  <View style={styles.productSelector}>
                    <Text style={styles.selectorLabel}>Select Product:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productCarousel}>
                      {order.items.map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[
                            styles.productOption,
                            selectedProductIndex === idx && styles.productOptionSelected,
                          ]}
                          onPress={() => setSelectedProductIndex(idx)}
                        >
                          <Text style={styles.productOptionText} numberOfLines={2}>
                            {item.product.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                <View style={styles.ratingSection}>
                  <Text style={styles.ratingLabel}>Rate this product:</Text>
                  <View style={styles.starContainer}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <TouchableOpacity key={star} onPress={() => setRating(star)}>
                        <Ionicons
                          name={star <= rating ? 'star' : 'star-outline'}
                          size={40}
                          color={star <= rating ? '#FF9800' : '#ddd'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.ratingValue}>{rating} out of 5</Text>
                </View>

                <View style={styles.commentSection}>
                  <Text style={styles.commentLabel}>Your Review:</Text>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Share your experience with this product..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={5}
                    value={comment}
                    onChangeText={setComment}
                  />
                </View>

                <View style={styles.imagesSection}>
                  <View style={styles.imageSectionHeader}>
                    <Text style={styles.imageSectionLabel}>Add Photos:</Text>
                    <Text style={styles.imageCount}>{selectedImages.length}/5</Text>
                  </View>
                  {selectedImages.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
                      {selectedImages.map((uri, idx) => (
                        <View key={idx} style={styles.imageWrapper}>
                          <Image source={{ uri }} style={styles.selectedImage} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => handleRemoveImage(idx)}
                          >
                            <Ionicons name="close-circle" size={28} color="#FF6B6B" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                  <TouchableOpacity
                    style={styles.pickImagesButton}
                    onPress={handlePickImages}
                    disabled={selectedImages.length >= 5}
                  >
                    <Ionicons name="image-outline" size={24} color={selectedImages.length >= 5 ? '#ccc' : '#007AFF'} />
                    <Text style={[
                      styles.pickImagesButtonText,
                      selectedImages.length >= 5 && { color: '#ccc' }
                    ]}>
                      {selectedImages.length === 0 ? 'Add Photos' : 'Add More Photos'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalButtonsContainer}>
                  <TouchableOpacity
                    style={styles.cancelModalButton}
                    onPress={() => setShowReviewModal(false)}
                  >
                    <Text style={styles.cancelModalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitReviewButton}
                    onPress={handleSubmitReview}
                  >
                    <Text style={styles.submitReviewButtonText}>Submit Review</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  itemDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    marginLeft: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
  },
  summaryValueDiscount: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  actionsContainer: {
    padding: 15,
    flexDirection: 'row',
    gap: 10,
  },
  deliveredActionsContainer: {
    padding: 15,
    flexDirection: 'column',
    gap: 12,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#000000',
  },
  returnButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  reportButtonText: {
    color: '#FF9800',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF9800',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  markReceivedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flex: 1,
  },
  markReceivedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  testNotificationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 10,
    flex: 1,
  },
  testNotificationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  // Review Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  productSelector: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  productCarousel: {
    marginBottom: 10,
  },
  productOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    minWidth: 100,
  },
  productOptionSelected: {
    backgroundColor: '#FF9800',
  },
  productOptionText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  ratingSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  ratingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  commentSection: {
    marginBottom: 20,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  imagesSection: {
    marginBottom: 20,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  imageSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  imageCount: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  imagesContainer: {
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  pickImagesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  pickImagesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitReviewButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF9800',
    alignItems: 'center',
  },
  submitReviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
