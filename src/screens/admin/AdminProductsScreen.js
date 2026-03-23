import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useSelector, useDispatch } from 'react-redux';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProducts,
  fetchCategories,
} from '../../store/slices/productSlice';
import { Ionicons } from '@expo/vector-icons';

const initialForm = {
  id: null,
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  categoryId: '',
  category: '',
  stock: '',
  brand: '',
  image: '',
  sale: false,
};

export default function AdminProductsScreen() {
  const dispatch = useDispatch();
  const products = useSelector(state => state.products.products);
  const categories = useSelector(state => state.products.categories);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  // Fetch products and categories in real-time whenever screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(fetchProducts());
      dispatch(fetchCategories());
    }, [dispatch])
  );

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    const firstCategory = categories[0];
    setForm({
      ...initialForm,
      categoryId: firstCategory?.id || '',
      category: firstCategory?.name || '',
    });
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: String(product.price ?? ''),
      originalPrice: String(product.originalPrice ?? ''),
      categoryId: product.categoryId || '',
      category: product.category || '',
      stock: String(product.stock ?? ''),
      brand: product.brand || '',
      image: product.image || '',
      sale: product.sale || false,
    });
    setShowForm(true);
  };

  const handleDeleteProduct = (productId) => {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await dispatch(deleteProduct(productId));
          Alert.alert('Success', 'Product deleted successfully');
        },
      },
    ]);
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setForm(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: [ImagePicker.MediaType.IMAGE],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setForm(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const handleImageSource = () => {
    Alert.alert('Select Image Source', 'Choose where to get the product image', [
      { text: 'Camera', onPress: handleTakePhoto },
      { text: 'Photo Library', onPress: handlePickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveProduct = async () => {
    if (!form.name.trim() || !form.price || !form.stock || !form.categoryId) {
      Alert.alert('Missing fields', 'Name, price, stock, and category are required.');
      return;
    }

    const payload = {
      id: form.id,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      originalPrice: Number(form.originalPrice || form.price),
      category: form.category,
      categoryId: form.categoryId,
      image: form.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400',
      images: [form.image || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400'],
      stock: Number(form.stock),
      brand: form.brand || 'FitSphere',
      sizes: ['Standard'],
      reviews: [],
      rating: 0,
      sale: form.sale,
    };

    try {
      setSubmitting(true);
      if (form.id) {
        await dispatch(updateProduct(payload)).unwrap();
      } else {
        await dispatch(createProduct(payload)).unwrap();
      }
      setShowForm(false);
      setForm(initialForm);
      Alert.alert('Success', `Product ${form.id ? 'updated' : 'created'} successfully`);
    } catch (error) {
      Alert.alert('Error', 'Unable to save product right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCategory}>{item.category}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          {item.originalPrice > item.price && (
            <Text style={styles.originalPrice}>${item.originalPrice.toFixed(2)}</Text>
          )}
        </View>
        <View style={[styles.stockBadge, { backgroundColor: item.stock < 10 ? '#ffebee' : '#e8f5e9' }]}>
          <Text style={[styles.stockText, { color: item.stock < 10 ? '#f44336' : '#10b981' }]}>
            Stock: {item.stock}
          </Text>
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditProduct(item)}>
          <Ionicons name="create-outline" size={20} color="#1e3a8a" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteProduct(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#f44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categoryOptions}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filterCategory === item && styles.filterChipActive]}
              onPress={() => setFilterCategory(item)}
            >
              <Text style={[styles.filterText, filterCategory === item && styles.filterTextActive]}>
                {item === 'all' ? 'All' : item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      <Modal visible={showForm} animationType="slide" onRequestClose={() => setShowForm(false)}>
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{form.id ? 'Edit Product' : 'Add Product'}</Text>

          <TouchableOpacity style={styles.imagePicker} onPress={handleImageSource}>
            {form.image ? (
              <Image source={{ uri: form.image }} style={styles.pickedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={28} color="#777" />
                <Text style={styles.imagePlaceholderText}>Take Photo or Pick from Library</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Product name"
            value={form.name}
            onChangeText={(value) => setForm(prev => ({ ...prev, name: value }))}
          />
          <TextInput
            style={[styles.input, styles.multiline]}
            multiline
            placeholder="Description"
            value={form.description}
            onChangeText={(value) => setForm(prev => ({ ...prev, description: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            keyboardType="decimal-pad"
            value={form.price}
            onChangeText={(value) => setForm(prev => ({ ...prev, price: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Original price"
            keyboardType="decimal-pad"
            value={form.originalPrice}
            onChangeText={(value) => setForm(prev => ({ ...prev, originalPrice: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Stock"
            keyboardType="number-pad"
            value={form.stock}
            onChangeText={(value) => setForm(prev => ({ ...prev, stock: value }))}
          />
          <TextInput
            style={styles.input}
            placeholder="Brand"
            value={form.brand}
            onChangeText={(value) => setForm(prev => ({ ...prev, brand: value }))}
          />

          <Text style={styles.sectionLabel}>Mark as Sale Product</Text>
          <TouchableOpacity
            style={styles.saleToggle}
            onPress={() => setForm(prev => ({ ...prev, sale: !prev.sale }))}
          >
            <View style={[styles.saleCheckbox, form.sale && styles.saleCheckboxActive]}>
              {form.sale && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.saleToggleText}>
              {form.sale ? 'This product is on sale' : 'Mark this product as on sale'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Category</Text>
          <TouchableOpacity
            style={styles.categoryDropdownToggle}
            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <Text style={styles.categoryDropdownText}>{form.category || 'Select a category'}</Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
          
          {showCategoryDropdown && (
            <View style={styles.categoryDropdownMenu}>
              <ScrollView nestedScrollEnabled style={styles.categoryDropdownScroll}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryDropdownItem,
                      form.categoryId === cat.id && styles.categoryDropdownItemActive,
                    ]}
                    onPress={() => {
                      setForm(prev => ({ ...prev, categoryId: cat.id, category: cat.name }));
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryDropdownItemText,
                        form.categoryId === cat.id && styles.categoryDropdownItemTextActive,
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, submitting && styles.disabledButton]}
              disabled={submitting}
              onPress={handleSaveProduct}
            >
              <Text style={styles.saveButtonText}>{submitting ? 'Saving...' : 'Save Product'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 14,
    color: '#212121',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 5,
  },
  filterChipActive: {
    backgroundColor: '#1e3a8a',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContent: {
    padding: 10,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 5,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
  },
  productActions: {
    justifyContent: 'center',
  },
  actionButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 12,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 12,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    color: '#777',
    fontWeight: '600',
  },
  pickedImage: {
    height: 160,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: '#222',
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#f3f3f3',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryChipActive: {
    backgroundColor: '#1e3a8a',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#555',
  },
  categoryChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
  categoryDropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
  },
  categoryDropdownText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  categoryDropdownMenu: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    maxHeight: 200,
    overflow: 'hidden',
  },
  categoryDropdownScroll: {
    maxHeight: 200,
  },
  categoryDropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryDropdownItemActive: {
    backgroundColor: '#f0f0f0',
  },
  categoryDropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  categoryDropdownItemTextActive: {
    fontWeight: '600',
    color: '#000',
  },
  saleToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  saleCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  saleCheckboxActive: {
    backgroundColor: '#FF8C42',
    borderColor: '#FF8C42',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saleToggleText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
