import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

export default function AdminShippingScreen({ navigation }) {
  const dispatch = useDispatch();
  
  const [shippingRates, setShippingRates] = useState([
    { id: '1', region: 'United States', method: 'Standard Shipping', price: 5.99, estimatedDays: '5-7 days', active: true },
    { id: '2', region: 'United States', method: 'Express Shipping', price: 12.99, estimatedDays: '2-3 days', active: true },
    { id: '3', region: 'Canada', method: 'International Shipping', price: 19.99, estimatedDays: '10-14 days', active: true },
    { id: '4', region: 'Europe', method: 'International Shipping', price: 24.99, estimatedDays: '14-21 days', active: false },
    { id: '5', region: 'Worldwide', method: 'Express International', price: 39.99, estimatedDays: '5-7 days', active: false },
  ]);

  const [editingRate, setEditingRate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRate, setNewRate] = useState({ region: '', method: '', price: '', estimatedDays: '' });

  const handleToggleActive = (rateId) => {
    setShippingRates(prev => prev.map(rate => 
      rate.id === rateId ? { ...rate, active: !rate.active } : rate
    ));
  };

  const handleEditRate = (rateId) => {
    const rate = shippingRates.find(r => r.id === rateId);
    if (rate) {
      setEditingRate(rate);
      setNewRate({ region: rate.region, method: rate.method, price: rate.price.toString(), estimatedDays: rate.estimatedDays });
      setShowAddForm(true);
    }
  };

  const handleDeleteRate = (rateId) => {
    Alert.alert('Delete Rate', 'Are you sure you want to delete this shipping rate?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        setShippingRates(prev => prev.filter(r => r.id !== rateId));
        Alert.alert('Success', 'Shipping rate deleted');
      }},
    ]);
  };

  const handleSaveRate = () => {
    if (!newRate.region || !newRate.method || !newRate.price || !newRate.estimatedDays) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (editingRate) {
      setShippingRates(prev => prev.map(rate => 
        rate.id === editingRate.id 
          ? { ...rate, ...newRate, price: parseFloat(newRate.price) } 
          : rate
      ));
      Alert.alert('Success', 'Shipping rate updated');
    } else {
      const newId = Date.now().toString();
      setShippingRates(prev => [...prev, { ...newRate, id: newId, price: parseFloat(newRate.price), active: true }]);
      Alert.alert('Success', 'Shipping rate added');
    }

    setShowAddForm(false);
    setEditingRate(null);
    setNewRate({ region: '', method: '', price: '', estimatedDays: '' });
  };

  const renderShippingRate = ({ item }) => (
    <View style={styles.rateCard}>
      <View style={styles.rateHeader}>
        <View>
          <Text style={styles.rateRegion}>{item.region}</Text>
          <Text style={styles.rateMethod}>{item.method}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.toggleButton, item.active ? styles.toggleActive : styles.toggleInactive]}
          onPress={() => handleToggleActive(item.id)}
        >
          <Text style={[styles.toggleText, item.active ? styles.toggleTextActive : styles.toggleTextInactive]}>
            {item.active ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rateDetails}>
        <View style={styles.rateInfo}>
          <Text style={styles.ratePrice}>${item.price.toFixed(2)}</Text>
          <Text style={styles.rateDays}>{item.estimatedDays}</Text>
        </View>

        <View style={styles.rateActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleEditRate(item.id)}>
            <Ionicons name="create-outline" size={20} color="#1e3a8a" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteRate(item.id)}>
            <Ionicons name="trash-outline" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Shipping Rates</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => {
          setShowAddForm(true);
          setEditingRate(null);
          setNewRate({ region: '', method: '', price: '', estimatedDays: '' });
        }}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
        <Text style={styles.infoText}>
          Configure shipping rates based on region and delivery method. Customers will see available options during checkout.
        </Text>
      </View>

      {showAddForm && (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {editingRate ? 'Edit Shipping Rate' : 'Add New Shipping Rate'}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Region</Text>
            <TextInput
              style={styles.input}
              value={newRate.region}
              onChangeText={(text) => setNewRate({ ...newRate, region: text })}
              placeholder="e.g., United States"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Shipping Method</Text>
            <TextInput
              style={styles.input}
              value={newRate.method}
              onChangeText={(text) => setNewRate({ ...newRate, method: text })}
              placeholder="e.g., Standard Shipping"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price ($)</Text>
            <TextInput
              style={styles.input}
              value={newRate.price}
              onChangeText={(text) => setNewRate({ ...newRate, price: text })}
              placeholder="e.g., 9.99"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estimated Delivery</Text>
            <TextInput
              style={styles.input}
              value={newRate.estimatedDays}
              onChangeText={(text) => setNewRate({ ...newRate, estimatedDays: text })}
              placeholder="e.g., 5-7 days"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {
              setShowAddForm(false);
              setEditingRate(null);
            }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveRate}>
              <Text style={styles.saveButtonText}>Save Rate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{shippingRates.length}</Text>
          <Text style={styles.statLabel}>Total Rates</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{shippingRates.filter(r => r.active).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#3b82f6' }]}>${(shippingRates.reduce((acc, r) => acc + r.price, 0) / shippingRates.length).toFixed(2)}</Text>
          <Text style={styles.statLabel}>Avg. Price</Text>
        </View>
      </View>

      <FlatList
        data={shippingRates}
        renderItem={renderShippingRate}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 10,
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212121',
  },
  formButtons: {
    flexDirection: 'row',
    marginTop: 10,
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
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1e3a8a',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  listContent: {
    padding: 15,
    paddingTop: 0,
  },
  rateCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  rateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  rateRegion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  rateMethod: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  toggleActive: {
    backgroundColor: '#e8f5e9',
  },
  toggleInactive: {
    backgroundColor: '#f5f5f5',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#1e3a8a',
  },
  toggleTextInactive: {
    color: '#999',
  },
  rateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  rateInfo: {
    flex: 1,
  },
  ratePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  rateDays: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rateActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
});
