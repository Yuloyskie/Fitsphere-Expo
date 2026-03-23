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
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '../../store/slices/promoSlice';
import notificationService from '../../services/NotificationService';

export default function AdminPromoCodesScreen() {
  const dispatch = useDispatch();
  const { promoCodes, loading } = useSelector(state => state.promo);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    description: '',
    minPurchaseAmount: '',
    maxUses: '',
    expiresAt: '',
  });

  useEffect(() => {
    dispatch(fetchPromoCodes());
  }, [dispatch]);

  const handleAddPromo = () => {
    setEditingId(null);
    setForm({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      description: '',
      minPurchaseAmount: '',
      maxUses: '',
      expiresAt: '',
    });
    setShowForm(true);
  };

  const handleEditPromo = (promo) => {
    setEditingId(promo.id);
    setForm({
      code: promo.code,
      discountType: promo.discountType || 'percentage',
      discountValue: promo.discountValue.toString(),
      description: promo.description || '',
      minPurchaseAmount: (promo.minPurchaseAmount || 0).toString(),
      maxUses: (promo.maxUses || '').toString(),
      expiresAt: promo.expiresAt || '',
    });
    setShowForm(true);
  };

  const handleSavePromo = async () => {
    if (!form.code || !form.discountValue || !form.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const discountValue = parseFloat(form.discountValue);
    if (isNaN(discountValue) || discountValue <= 0) {
      Alert.alert('Error', 'Discount value must be a positive number');
      return;
    }

    const promoData = {
      code: form.code.toUpperCase(),
      discountType: form.discountType,
      discountValue,
      description: form.description,
      minPurchaseAmount: parseFloat(form.minPurchaseAmount) || 0,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      active: true,
    };

    try {
      if (editingId) {
        await dispatch(updatePromoCode({ id: editingId, data: promoData })).unwrap();
        Alert.alert('Success', 'Promo code updated successfully');
      } else {
        await dispatch(createPromoCode(promoData)).unwrap();
        
        // Send promotion notification
        const discountText = form.discountType === 'percentage' 
          ? `${form.discountValue}% off` 
          : `$${form.discountValue} off`;
        
        await notificationService.sendLocalNotification(
          'New Promotion Available! 🎉',
          `Get ${discountText} with code: ${form.code.toUpperCase()}\n\n${form.description}`,
          {
            type: 'promotion',
            promoCode: form.code.toUpperCase(),
          }
        );

        Alert.alert('Success', `Promo code created!\nCode: ${form.code.toUpperCase()}`);
      }
      setShowForm(false);
      setForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        description: '',
        minPurchaseAmount: '',
        maxUses: '',
        expiresAt: '',
      });
    } catch (error) {
      Alert.alert('Error', error || 'Failed to save promo code');
    }
  };

  const handleDeletePromo = (promoId) => {
    Alert.alert(
      'Delete Promo Code',
      'Are you sure you want to delete this promo code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deletePromoCode(promoId)).unwrap();
              Alert.alert('Success', 'Promo code deleted successfully');
            } catch (error) {
              Alert.alert('Error', error || 'Failed to delete promo code');
            }
          },
        },
      ]
    );
  };

  const renderPromoItem = ({ item }) => {
    const discountDisplay = item.discountType === 'percentage'
      ? `${item.discountValue}% off`
      : `$${item.discountValue} off`;

    const isExpired = item.expiresAt && new Date(item.expiresAt) < new Date();
    const maxUsesReached = item.maxUses && item.usedCount >= item.maxUses;

    return (
      <View style={styles.promoCard}>
        <View style={styles.promoHeader}>
          <View>
            <Text style={styles.promoCode}>{item.code}</Text>
            <Text style={styles.promoDiscount}>{discountDisplay}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor: isExpired || maxUsesReached ? '#ef4444' : (item.active ? '#10b981' : '#808080')
            }
          ]}>
            <Text style={styles.statusText}>
              {isExpired ? 'Expired' : maxUsesReached ? 'Max Uses' : (item.active ? 'Active' : 'Inactive')}
            </Text>
          </View>
        </View>

        <Text style={styles.promoDescription}>{item.description}</Text>

        <View style={styles.promoMeta}>
          {item.minPurchaseAmount > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color="#666" />
              <Text style={styles.metaText}>Min: ${item.minPurchaseAmount}</Text>
            </View>
          )}
          {item.expiresAt && (
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.metaText}>Expires: {new Date(item.expiresAt).toLocaleDateString()}</Text>
            </View>
          )}
          {item.maxUses && (
            <View style={styles.metaItem}>
              <Ionicons name="copy-outline" size={14} color="#666" />
              <Text style={styles.metaText}>Used: {item.usedCount}/{item.maxUses}</Text>
            </View>
          )}
        </View>

        <View style={styles.promoActions}>
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Promo Codes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPromo}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      ) : promoCodes.length === 0 ? (
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

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Promo Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., SUMMER20"
                value={form.code}
                onChangeText={(text) => setForm({ ...form, code: text.toUpperCase() })}
                editable={!editingId}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Discount Type *</Text>
              <View style={styles.discountTypeContainer}>
                <TouchableOpacity
                  style={[styles.typeButton, form.discountType === 'percentage' && styles.typeButtonActive]}
                  onPress={() => setForm({ ...form, discountType: 'percentage' })}
                >
                  <Text style={[styles.typeButtonText, form.discountType === 'percentage' && styles.typeButtonTextActive]}>
                    Percentage (%)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, form.discountType === 'fixed' && styles.typeButtonActive]}
                  onPress={() => setForm({ ...form, discountType: 'fixed' })}
                >
                  <Text style={[styles.typeButtonText, form.discountType === 'fixed' && styles.typeButtonTextActive]}>
                    Fixed ($)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Discount Value *</Text>
              <View style={styles.discountInput}>
                <TextInput
                  style={styles.input}
                  placeholder={form.discountType === 'percentage' ? '20' : '50'}
                  value={form.discountValue}
                  onChangeText={(text) => setForm({ ...form, discountValue: text })}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#999"
                />
                <Text style={styles.unitSign}>{form.discountType === 'percentage' ? '%' : '$'}</Text>
              </View>

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., 20% off summer sale on all equipment"
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                multiline
                numberOfLines={3}
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Minimum Purchase Amount ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={form.minPurchaseAmount}
                onChangeText={(text) => setForm({ ...form, minPurchaseAmount: text })}
                keyboardType="decimal-pad"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Maximum Uses (Leave empty for unlimited)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 100"
                value={form.maxUses}
                onChangeText={(text) => setForm({ ...form, maxUses: text })}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />

              <Text style={styles.label}>Expiration Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2025-12-31"
                value={form.expiresAt}
                onChangeText={(text) => setForm({ ...form, expiresAt: text })}
                placeholderTextColor="#999"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSavePromo}
              >
                <Text style={styles.saveButtonText}>Save Promo Code</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#000000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountTypeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  typeButtonActive: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  unitSign: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: -8,
    zIndex: 1,
  },
});
