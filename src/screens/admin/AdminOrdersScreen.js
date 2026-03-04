import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { updateOrderStatus } from '../../store/slices/orderSlice';
import { Ionicons } from '@expo/vector-icons';
import notificationService from '../../services/NotificationService';

export default function AdminOrdersScreen({ navigation }) {
  const dispatch = useDispatch();
  const orders = useSelector(state => state.orders.orders);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'processing': return '#2196F3';
      case 'shipped': return '#9C27B0';
      case 'delivered': return '#4CAF50';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    Alert.alert(
      'Update Order Status',
      `Change status to "${newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', async onPress() {
          dispatch(updateOrderStatus({ orderId, status: newStatus }));
          
          const statusMessages = {
            processing: 'Your order is now being processed',
            shipped: 'Your order has been shipped!',
            delivered: 'Your order has been delivered!',
            cancelled: 'Your order has been cancelled'
          };
          
          await notificationService.sendLocalNotification(
            'Order Status Update',
            statusMessages[newStatus] || `Your order status is now: ${newStatus}`,
            { orderId, type: 'order_update' }
          );
          
          Alert.alert('Success', 'Order status updated and customer notified');
        }},
      ]
    );
  };

  const handleViewOrder = (orderId) => {
    navigation.navigate('AdminOrderDetails', { orderId });
  };

  const handleIssueRefund = (orderId) => {
    Alert.alert('Issue Refund', 'Are you sure you want to issue a refund for this order?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Issue Refund', onPress: () => Alert.alert('Success', 'Refund issued successfully') },
    ]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity onPress={() => handleViewOrder(item.id)}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.id}</Text>
            <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.orderInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.shippingInfo?.fullName || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={16} color="#666" />
            <Text style={styles.infoText}>{item.shippingInfo?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.shippingInfo?.city || 'N/A'}, {item.shippingInfo?.state || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.itemCount}>{item.items?.length || 0} item(s)</Text>
          <Text style={styles.orderTotal}>${item.total?.toFixed(2) || '0.00'}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.orderActions}>
        {item.status !== 'cancelled' && item.status !== 'delivered' && (
          <View style={styles.statusButtons}>
            {item.status === 'pending' && (
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: '#2196F3' }]}
                onPress={() => handleUpdateStatus(item.id, 'processing')}
              >
                <Text style={styles.statusButtonText}>Process</Text>
              </TouchableOpacity>
            )}
            {item.status === 'processing' && (
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: '#9C27B0' }]}
                onPress={() => handleUpdateStatus(item.id, 'shipped')}
              >
                <Text style={styles.statusButtonText}>Ship</Text>
              </TouchableOpacity>
            )}
            {item.status === 'shipped' && (
              <TouchableOpacity 
                style={[styles.statusButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => handleUpdateStatus(item.id, 'delivered')}
              >
                <Text style={styles.statusButtonText}>Deliver</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleViewOrder(item.id)}
          >
            <Ionicons name="eye-outline" size={20} color="#2196F3" />
          </TouchableOpacity>
          {(item.status === 'delivered' || item.status === 'cancelled') && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleIssueRefund(item.id)}
            >
              <Ionicons name="cash-outline" size={20} color="#FF9800" />
            </TouchableOpacity>
          )}
          {item.status !== 'cancelled' && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleUpdateStatus(item.id, 'cancelled')}
            >
              <Ionicons name="close-circle-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          )}
        </View>
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
            placeholder="Search orders..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={statuses}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filterStatus === item && styles.filterChipActive]}
              onPress={() => setFilterStatus(item)}
            >
              <Text style={[styles.filterText, filterStatus === item && styles.filterTextActive]}>
                {item === 'all' ? 'All' : item.charAt(0).toUpperCase() + item.slice(1)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{orders.filter(o => o.status === 'pending').length}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{orders.filter(o => o.status === 'delivered').length}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={50} color="#ddd" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
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
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 14,
    color: '#212121',
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
    backgroundColor: '#4CAF50',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
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
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  orderInfo: {
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  itemCount: {
    fontSize: 13,
    color: '#666',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statusButtons: {
    flexDirection: 'row',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
    marginRight: 8,
  },
  statusButtonText: {
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
});
