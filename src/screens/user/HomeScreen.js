import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView, RefreshControl, Modal, ImageBackground } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchProductsByCategory, setSelectedCategory } from '../../store/slices/productSlice';
import { addNotification, removeNotification } from '../../store/slices/notificationSlice';
import { Ionicons } from '@expo/vector-icons';
import LoadingComponent from '../../components/LoadingComponent';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { products, categories, filteredProducts, selectedCategory, loading } = useSelector(state => state.products);
  const notifications = useSelector(state => state.notifications.notifications);
  const [refreshing, setRefreshing] = useState(false);
  const [showSale, setShowSale] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProductsByCategory(selectedCategory));
  }, [selectedCategory, dispatch]);

  // Set notification icon button in header
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications" size={24} color="#000000" />
            {notifications.length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notifications.length > 9 ? '9+' : notifications.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ),
      });
    }, [navigation, notifications])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchProducts());
    await dispatch(fetchCategories());
    setRefreshing(false);
  };

  const handleCategoryPress = (categoryId) => {
    setShowSale(false);
    dispatch(setSelectedCategory(categoryId));
  };

  const handleShopNow = () => {
    setShowSale(true);
  };

  const handleNotificationClick = (notification) => {
    setShowNotifications(false);
    
    if (notification.orderId) {
      navigation.navigate('OrderDetails', { orderId: notification.orderId });
    } else if (notification.productId) {
      navigation.navigate('ProductDetails', { productId: notification.productId });
    } else {
      navigation.navigate('NotificationDetails', {
        title: notification.title,
        body: notification.body,
      });
    }

    // Remove notification from Redux
    dispatch(removeNotification(notification.id));
  };

  // Add test notification to Redux
  const addTestNotification = () => {
    dispatch(addNotification({
      title: 'Order Processed',
      body: 'Your order #12345 has been processed',
      orderId: '67890',
    }));
  };

  // Filter products based on sale status
  const displayedProducts = showSale ? products.filter(p => p.sale === true) : filteredProducts;

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.categoryItem, selectedCategory === item.id && styles.categoryItemActive]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Ionicons 
        name={item.icon} 
        size={24} 
color={selectedCategory === item.id ? '#fff' : '#000000'}
      />
      <Text style={[styles.categoryText, selectedCategory === item.id && styles.categoryTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
    >
      <View style={styles.productImageContainer}>
        <Image 
          source={{ uri: item.image || 'https://via.placeholder.com/400?text=No+Image' }} 
          style={styles.productImage}
          onError={() => console.log('Image failed to load for product:', item.id)}
        />
        {item.sale && <View style={styles.saleTag}><Text style={styles.saleText}>SALE</Text></View>}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
          )}
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
          <Text style={styles.reviewCount}>({item.reviews.length} reviews)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => handleNotificationClick(item)}
    >
      <View style={styles.notificationIconContainer}>
        <Ionicons name="notifications" size={24} color="#FF8C42" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationItemTitle}>{item.title}</Text>
        <Text style={styles.notificationItemBody} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notificationTime}>
          {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleNotificationClick(item)}
        style={styles.notificationArrow}
      >
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>SALE!!!!!</Text>
          <Text style={styles.bannerSubtitle}>Up to 40% Off</Text>
          <TouchableOpacity style={styles.bannerButton} onPress={handleShopNow}>
            <Text style={styles.bannerButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {!showSale && (
        <>
          {/* Categories */}
          <View style={styles.categoriesSection}>
            <FlatList
              data={[{ id: 'all', name: 'All', icon: 'apps' }, ...categories]}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              horizontal={true}
              scrollEnabled={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesListContent}
              style={styles.categoriesList}
            />
          </View>

          {/* Featured Products */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === 'all' ? 'All Products' : categories.find(c => c.id === selectedCategory)?.name || 'Products'}
              </Text>
            </View>
          </View>
        </>
      )}

      {showSale && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={() => setShowSale(false)}>
              <Ionicons name="arrow-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>Sale Products</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>
      )}
    </View>
  );

  return (
    <ImageBackground 
      source={require('../../../images/StoreBg.webp')}
      style={styles.container}
    >
      <View style={styles.overlayWhite} />
      <FlatList
        data={displayedProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#000000']} />
        }
        ListEmptyComponent={
          loading ? <LoadingComponent /> : <Text style={styles.emptyText}>No products found</Text>
        }
      />
      {loading && (
        <Modal transparent={true} animationType="none" visible={loading}>
          <View style={styles.loadingOverlay}>
            <LoadingComponent />
          </View>
        </Modal>
      )}

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.notificationsModal}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notifications</Text>
            <TouchableOpacity onPress={() => setShowNotifications(false)}>
              <Ionicons name="close" size={28} color="#000" />
            </TouchableOpacity>
          </View>

          {notifications.length === 0 ? (
            <View style={styles.noNotificationsContainer}>
              <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
              <Text style={styles.noNotificationsText}>No notifications yet</Text>
              <TouchableOpacity 
                style={styles.testNotificationButton}
                onPress={addTestNotification}
              >
                <Text style={styles.testNotificationButtonText}>Add Test Notification</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.notificationsList}
            />
          )}
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlayWhite: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF8C42',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationsModal: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  notificationsList: {
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notificationItemBody: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  notificationArrow: {
    padding: 5,
  },
  noNotificationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noNotificationsText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
    marginBottom: 30,
  },
  testNotificationButton: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testNotificationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  listContent: {
    paddingBottom: 20,
  },
  banner: {
backgroundColor: '#000000',
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  bannerContent: {
    padding: 20,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  bannerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  bannerButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  bannerButtonText: {
color: '#000000',
    fontWeight: 'bold',
  },
  section: {
    marginTop: 15,
    paddingHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  categoriesSection: {
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 15,
  },
  categoriesContent: {
    flex: 1,
    maxHeight: 220,
  },
  categoriesList: {
    flexGrow: 0,
  },
  categoriesListContent: {
    paddingHorizontal: 5,
  },
sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryItemActive: {
backgroundColor: '#000000',
  },
  categoryText: {
    marginTop: 5,
    fontSize: 12,
color: '#333333',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  saleTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF8C42',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
color: '#333333',
    height: 40,
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
color: '#000000',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
color: '#333333',
    marginLeft: 3,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 3,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});
