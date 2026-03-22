import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { fetchProductById } from '../../store/slices/productSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { Ionicons } from '@expo/vector-icons';

export default function ProductDetailsScreen({ route, navigation }) {
  const { productId } = route.params;
  const dispatch = useDispatch();
  const { selectedProduct, loading } = useSelector(state => state.products);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchProductById(productId));
  }, [dispatch, productId]);

  // Refetch product when screen comes into focus (after reviewing)
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchProductById(productId));
    }, [dispatch, productId])
  );

  useEffect(() => {
    if (selectedProduct?.sizes?.length > 0) {
      setSelectedSize(selectedProduct.sizes[0]);
    }
  }, [selectedProduct]);

  const handleAddToCart = () => {
    // Only check size if product has sizes defined
    if (selectedProduct?.sizes?.length > 0 && !selectedSize) {
      Alert.alert('Error', 'Please select a size');
      return;
    }
    dispatch(addToCart({ product: selectedProduct, quantity, size: selectedProduct?.sizes?.length > 0 ? selectedSize : '' }));
    Alert.alert('Success', 'Product added to cart!', [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('UserDrawer', { screen: 'Home', params: { screen: 'Cart' } }) },
    ]);
  };

  const handleReview = () => {
    navigation.navigate('ProductReviews', { productId: selectedProduct.id });
  };

  if (loading || !selectedProduct) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const images = selectedProduct.images || [selectedProduct.image];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: images[selectedImageIndex] }} style={styles.mainImage} />
          {images.length > 1 && (
            <View style={styles.thumbnailContainer}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImageIndex(index)}
                  style={[styles.thumbnail, selectedImageIndex === index && styles.thumbnailActive]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{selectedProduct.name}</Text>
          <Text style={styles.productCategory}>{selectedProduct.category}</Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>${selectedProduct.price.toFixed(2)}</Text>
            {selectedProduct.originalPrice > selectedProduct.price && (
              <Text style={styles.originalPrice}>${selectedProduct.originalPrice.toFixed(2)}</Text>
            )}
          </View>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={18} color="#FFD700" />
            <Text style={styles.rating}>{selectedProduct.rating}</Text>
            <Text style={styles.reviewCount}>({selectedProduct.reviews.length} reviews)</Text>
            <TouchableOpacity onPress={handleReview}>
              <Text style={styles.viewReviews}>View Reviews</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.brand}>Brand: {selectedProduct.brand}</Text>
          <Text style={styles.stock}>Stock: {selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : 'Out of stock'}</Text>

          {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
            <View style={styles.sizeContainer}>
              <Text style={styles.sizeLabel}>Select Size:</Text>
              <View style={styles.sizeOptions}>
                {selectedProduct.sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[styles.sizeOption, selectedSize === size && styles.sizeOptionActive]}
                    onPress={() => setSelectedSize(size)}
                  >
                    <Text style={[styles.sizeText, selectedSize === size && styles.sizeTextActive]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={20} color="#000000" />
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
              >
                <Ionicons name="add" size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{selectedProduct.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>${(selectedProduct.price * quantity).toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addToCartButton, selectedProduct.stock === 0 && styles.addToCartDisabled]}
          onPress={handleAddToCart}
          disabled={selectedProduct.stock === 0}
        >
          <Ionicons name="cart" size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            {selectedProduct.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    backgroundColor: '#f5f5f5',
  },
  mainImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    padding: 10,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#000000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 15,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 5,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  viewReviews: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 10,
    fontWeight: '600',
  },
  brand: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  stock: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sizeContainer: {
    marginTop: 20,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
    marginBottom: 10,
  },
  sizeOptionActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  sizeText: {
    fontSize: 14,
    color: '#333333',
  },
  sizeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginRight: 15,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 20,
  },
  descriptionContainer: {
    marginTop: 25,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  addToCartDisabled: {
    backgroundColor: '#ccc',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
