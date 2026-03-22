import React, { useState } from 'react';
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
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import notificationService from '../../services/NotificationService';

export default function AdminPromoCodesScreen() {
  const [promoCodes, setPromoCodes] = useState([
    { id: '1', code: 'WELCOME10', discount: 10, description: '10% off first order', active: true, createdAt: '2024-01-01', expiresAt: '2024-12-31' },
    { id: '2', code: 'SAVE20', discount: 20, description: '20% off summer sale', active: true, createdAt: '2024-01-05', expiresAt: '2024-08-31' },
    { id: '3', code: 'FIT50', discount: 50, description: '$50 off orders over $200', active: false, createdAt: '2023-12-01', expiresAt: '2024-01-10' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: '',
    discount: '',
    description: '',
    expiresAt: '',
  });

  const handleAddPromo = () => {
    setEditingId(null);
    setForm({ code: '', discount: '', description: '', expiresAt: '' });
    setShowForm(true);
  };

  const handleEditPromo = (promo) => {
    setEditingId(promo.id);
    setForm({
      code: promo.code,
      discount: promo.discount.toString(),
      description: promo.description,
      expiresAt: promo.expiresAt,
    });
    setShowForm(true);
  };

  const handleSavePromo = async () => {
    if (!form.code || !form.discount || !form.description || !form.expiresAt) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isNaN(parseInt(form.discount)) || parseInt(form.discount) < 1 || parseInt(form.discount) > 100) {
      Alert.alert('Error', 'Discount must be between 1 and 100');
      return;
    }

    const promoCodeUpper = form.code.toUpperCase();

    try {
      if (editingId) {
        // Update existing
        setPromoCodes(promoCodes.map(p =>
          p.id === editingId
            ? { ...p, code: promoCodeUpper, discount: parseInt(form.discount), description: form.description, expiresAt: form.expiresAt }
            : p
        ));
        Alert.alert('Success', 'Promo code updated successfully');
      } else {
        // Create new
        const newPromo = {
          id: Date.now().toString(),
          code: promoCodeUpper,
          discount: parseInt(form.discount),
          description: form.description,
          expiresAt: form.expiresAt,
          active: true,
          createdAt: new Date().toISOString().split('T')[0],
        };
        setPromoCodes([...promoCodes, newPromo]);

        // Send promotion notification
        await notificationService.sendLocalNotification(
          'New Promotion Available! 🎉',
          `Get ${newPromo.discount}% off with code: ${promoCodeUpper}\n\n${newPromo.description}`,
          {
            type: 'promotion',
            promoCode: promoCodeUpper,
            discount: newPromo.discount,
            description: newPromo.description,
          }
        );

        Alert.alert('Success', `Promo code created and notification sent!\nCode: ${promoCodeUpper}`);
      }
      setShowForm(false);
      setForm({ code: '', discount: '', description: '', expiresAt: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to save promo code');
      console.error(error);
    }
  };

  const handleDeletePromo = (id) => {
    Alert.alert(
      'Delete Promo Code',
      'Are you sure you want to delete this promo code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setPromoCodes(promoCodes.filter(p => p.id !== id));
            Alert.alert('Success', 'Promo code deleted');
          },
        },
      ]
    );
  };

  const togglePromoStatus = (id) => {
    setPromoCodes(promoCodes.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const renderPromoItem = ({ item }) => (
    <View style={styles.promoCard}>
      <View style={styles.promoHeader}>
        <View>
          <Text style={styles.promoCode}>{item.code}</Text>
          <Text style={styles.promoDiscount}>{item.discount}% Discount</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.active ? '#10b981' : '#ef4444' }]}>
          <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      <Text style={styles.promoDescription}>{item.description}</Text>

      <View style={styles.promoMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.metaText}>Expires: {item.expiresAt}</Text>
        </View>
      </View>

      <View style={styles.promoActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.active ? '#ff6b6b' : '#4B5563' }]}
          onPress={() => togglePromoStatus(item.id)}
        >
          <Ionicons name={item.active ? 'power-outline' : 'checkmark-outline'} size={16} color="#fff" />
          <Text style={styles.actionButtonText}>{item.active ? 'Deactivate' : 'Activate'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditPromo(item)}
        >
          <Ionicons name="pencil-outline" size={16} color="#4B5563" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeletePromo(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Promo Codes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPromo}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {promoCodes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="ticket-outline" size={60} color="#ddd" />
          <Text style={styles.emptyText}>No promo codes yet</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleAddPromo}>
            <Text style={styles.createButtonText}>Create First Code</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={promoCodes}
          renderItem={renderPromoItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Promo Code' : 'Create Promo Code'}</Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Promo Code</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., SUMMER20"
                value={form.code}
                onChangeText={(text) => setForm({ ...form, code: text.toUpperCase() })}
                editable={!editingId}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Discount Percentage (1-100)</Text>
              <View style={styles.discountInput}>
                <TextInput
                  style={styles.input}
                  placeholder="20"
                  value={form.discount}
                  onChangeText={(text) => setForm({ ...form, discount: text })}
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
                <Text style={styles.percentSign}>%</Text>
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., 20% off summer sale on all equipment"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Expiration Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-12-31"
                value={form.expiresAt}
                onChangeText={(text) => setForm({ ...form, expiresAt: text })}
                placeholderTextColor="#999"
              />

              {editingId && (
                <View style={styles.infoBox}>
                  <Ionicons name="information-circle-outline" size={16} color="#0066cc" />
                  <Text style={styles.infoText}>Original code cannot be changed. Create a new code if needed.</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePromo}>
                <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>{editingId ? 'Update' : 'Create'}</Text>
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
  header: {
    backgroundColor: '#4B5563',
    paddingStart: 20,
    paddingEnd: 20,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF8C42',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 15,
  },
  promoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  promoCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B5563',
    letterSpacing: 1,
  },
  promoDiscount: {
    fontSize: 14,
    color: '#FF8C42',
    fontWeight: '600',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  promoDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  promoMeta: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  promoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  editButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  editButtonText: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  deleteButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  createButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: '#FF8C42',
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  discountInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentSign: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C42',
    marginLeft: 10,
  },
  textArea: {
    textAlignVertical: 'top',
    height: 80,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#0066cc',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 13,
    color: '#0066cc',
    marginLeft: 10,
    flex: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
