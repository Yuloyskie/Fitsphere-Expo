import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ScrollView, RefreshControl, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchProductsByCategory, setSelectedCategory } from '../../store/slices/productSlice';
import { Ionicons } from '@expo/vector-icons';
import LoadingComponent from '../../components/LoadingComponent';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { products, categories, filteredProducts, selectedCategory, loading } = useSelector(state => state.products);
  const [refreshing, setRefreshing] = useState(false);
  const [showSale, setShowSale] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProductsByCategory(selectedCategory));
  }, [selectedCategory, dispatch]);

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
      <Image source={{ uri: item.image }} style={styles.productImage} />
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
              scrollEnabled={true}
              nestedScrollEnabled={true}
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 10,
    marginRight: 0,
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
  productImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
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
