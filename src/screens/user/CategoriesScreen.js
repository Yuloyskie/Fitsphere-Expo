import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slices/productSlice';

export default function CategoriesScreen({ navigation }) {
  const dispatch = useDispatch();
  const { categories } = useSelector(state => state.products);

  const categoryBanners = [
    { id: '1', name: 'Strength Training', image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=400', description: 'Build muscle and strength' },
    { id: '2', name: 'Cardio', image: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400', description: 'Improve your endurance' },
    { id: '3', name: 'Accessories', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', description: 'Essential workout gear' },
    { id: '4', name: 'Recovery', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400', description: 'Heal and recover properly' },
    { id: '5', name: 'Nutrition', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400', description: 'Fuel your body right' },
    { id: '6', name: 'Apparel', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', description: 'Look good, perform better' },
  ];

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleCategoryPress = (categoryId) => {
    // Navigate to home with selected category
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <View style={styles.categoryOverlay}>
        <Text style={styles.categoryName}>{item.name}</Text>   
        <Text style={styles.categoryDescription}>{item.description}</Text>   
      </View> 
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop by Category</Text>   
      <Text style={styles.subtitle}>Find exactly what you need</Text>
      <FlatList  
        data={categoryBanners}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  categoryCard: {
    marginHorizontal: 10,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 15,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryDescription: {
    fontSize: 14,
    color: '#fff',
    marginTop: 5,
  },
});
