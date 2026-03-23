import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { createUser, deleteUser, fetchAllUsers, updateUser } from '../../store/slices/adminSlice';
import { Ionicons } from '@expo/vector-icons';

const initialForm = {
  id: null,
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: 'user',
};

export default function AdminUsersScreen() {
  const dispatch = useDispatch();
  const users = useSelector(state => state.admin.users);
  const loading = useSelector(state => state.admin.loading);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(
    () => users.filter(user => {
      // Exclude admin@fitsphere.com from user management
      if (user.email === 'admin@fitsphere.com') {
        return false;
      }
      const displayName = user.fullName || user.name || '';
      return (
        displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
    [users, searchQuery]
  );

  const openCreateModal = () => {
    setForm(initialForm);
    setShowPassword(false);
    setShowAddModal(true);
  };

  const openEditModal = (user) => {
    setForm({
      id: user.id,
      fullName: user.fullName || user.name || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      role: user.role || 'user',
    });
    setShowPassword(false);
    setShowAddModal(true);
  };

  const handleDeleteUser = (userId, displayName) => {
    Alert.alert(
      'Delete Account',
      `Delete account for ${displayName}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteUser(userId)).unwrap();
              Alert.alert('Success', 'Account deleted by admin.');
            } catch (error) {
              Alert.alert('Error', error?.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const handleSaveUser = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      Alert.alert('Error', 'Full name and email are required.');
      return;
    }

    if (!form.id && !form.password.trim()) {
      Alert.alert('Error', 'Password is required when creating a user.');
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      role: form.role,
    };

    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    try {
      setSaving(true);
      if (form.id) {
        await dispatch(updateUser({ userId: form.id, userData: payload })).unwrap();
      } else {
        await dispatch(createUser(payload)).unwrap();
      }
      setShowAddModal(false);
      setForm(initialForm);
      Alert.alert('Success', `User ${form.id ? 'updated' : 'created'} successfully`);
    } catch (error) {
      Alert.alert('Error', error?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const renderUserItem = ({ item }) => {
    const isAdminAccount = item.email === 'admin@fitsphere.com';
    
    return (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.fullName || item.name || 'U').charAt(0)}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={styles.userName}>{item.fullName || item.name || 'User'}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userPhone}>{item.phone || 'No phone'}</Text>
        </View>
      </View>
      
      <View style={styles.userActions}>
        <View style={[styles.statusBadge, { backgroundColor: item.role === 'admin' ? '#8b5cf6' : '#10b981' }]}>
          <Text style={styles.statusText}>{item.role || 'user'}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          {!isAdminAccount && (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                <Ionicons name="create-outline" size={20} color="#1e3a8a" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteUser(item.id, item.fullName || item.name || 'user')}
              >
                <Ionicons name="trash-outline" size={20} color="#f44336" />
              </TouchableOpacity>
            </>
          )}
          {isAdminAccount && (
            <Text style={styles.lockedText}>System Admin</Text>
          )}
        </View>
      </View>
    </View>
  );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#8b5cf6' }]}>{users.filter(u => u.role === 'admin').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{users.filter(u => u.role !== 'admin').length}</Text>
          <Text style={styles.statLabel}>Admins</Text>
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUserItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => dispatch(fetchAllUsers())}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={50} color="#ddd" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />

      <Modal visible={showAddModal} animationType="slide" onRequestClose={() => {
        setShowAddModal(false);
        setShowPassword(false);
      }}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{form.id ? 'Edit User Account' : 'Create User Account'}</Text>

          <TextInput
            style={styles.modalInput}
            placeholder="Full Name"
            value={form.fullName}
            onChangeText={(value) => setForm(prev => ({ ...prev, fullName: value }))}
          />
          <TextInput
            style={styles.modalInput}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(value) => setForm(prev => ({ ...prev, email: value }))}
          />
          <View style={styles.passwordModalInputContainer}>
            <TextInput
              style={styles.passwordModalInput}
              placeholder={form.id ? 'New Password (optional)' : 'Password'}
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(value) => setForm(prev => ({ ...prev, password: value }))}
            />
            <TouchableOpacity 
              style={styles.eyeIconButtonModal}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye' : 'eye-off'} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Phone"
            value={form.phone}
            onChangeText={(value) => setForm(prev => ({ ...prev, phone: value }))}
          />

          <View style={styles.roleRow}>
            <Text style={styles.roleLabel}>Role</Text>
            <View style={styles.roleButtons}>
              <TouchableOpacity
                style={[styles.roleButton, form.role === 'user' && styles.roleButtonActive]}
                onPress={() => setForm(prev => ({ ...prev, role: 'user' }))}
              >
                <Text style={[styles.roleButtonText, form.role === 'user' && styles.roleButtonTextActive]}>User</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleButton, form.role === 'admin' && styles.roleButtonActive]}
                onPress={() => setForm(prev => ({ ...prev, role: 'admin' }))}
              >
                <Text style={[styles.roleButtonText, form.role === 'admin' && styles.roleButtonTextActive]}>Admin</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {
              setShowAddModal(false);
              setShowPassword(false);
            }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} disabled={saving} onPress={handleSaveUser}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
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
    padding: 10,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    fontSize: 15,
    color: '#222',
  },
  passwordModalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingRight: 12,
    marginBottom: 12,
  },
  passwordModalInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
    borderWidth: 0,
  },
  eyeIconButtonModal: {
    padding: 8,
  },
  roleRow: {
    marginTop: 4,
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  roleButtons: {
    flexDirection: 'row',
  },
  roleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f3f3',
    marginRight: 8,
  },
  roleButtonActive: {
    backgroundColor: '#1e3a8a',
  },
  roleButtonText: {
    color: '#555',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  lockedText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
});
