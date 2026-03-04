import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/adminSlice';
import { Ionicons } from '@expo/vector-icons';

export default function AdminDashboardScreen({ navigation }) {
  const dispatch = useDispatch();
  const admin = useSelector(state => state.admin.admin);
  const orders = useSelector(state => state.orders.orders);
  const products = useSelector(state => state.products.products);
  const users = useSelector(state => state.users?.users || []);

  const stats = [
    { id: 'totalSales', title: 'Total Sales', value: `$${(orders.reduce((acc, o) => acc + o.total, 0)).toFixed(2)}`, icon: 'cash', color: '#4CAF50' },
    { id: 'totalOrders', title: 'Total Orders', value: orders.length, icon: 'receipt', color: '#2196F3' },
    { id: 'activeUsers', title: 'Active Users', value: users.length || 125, icon: 'people', color: '#FF9800' },
    { id: 'totalProducts', title: 'Total Products', value: products.length || 48, icon: 'cube', color: '#9C27B0' },
  ];

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const quickActions = [
    { id: 'users', title: 'Manage Users', icon: 'people-outline', screen: 'AdminUsers' },
    { id: 'products', title: 'Manage Products', icon: 'cube-outline', screen: 'AdminProducts' },
    { id: 'orders', title: 'Manage Orders', icon: 'receipt-outline', screen: 'AdminOrders' },
    { id: 'shipping', title: 'Shipping Rates', icon: 'airplane-outline', screen: 'AdminShipping' },
    { id: 'reports', title: 'Reports', icon: 'bar-chart-outline', screen: 'AdminReports' },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('AdminLogin');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.adminName}>{admin?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.id} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
              <Ionicons name={stat.icon} size={24} color="#fff" />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statTitle}>{stat.title}</Text>
          </View>
        ))}
      </View>

      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Quick Alerts</Text>
        
        {pendingOrders > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate('AdminOrders')}
          >
            <View style={[styles.alertIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="time-outline" size={20} color="#fff" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{pendingOrders} Pending Orders</Text>
              <Text style={styles.alertSubtitle}>Require immediate attention</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}

        {lowStockProducts > 0 && (
          <TouchableOpacity 
            style={styles.alertCard}
            onPress={() => navigation.navigate('AdminProducts')}
          >
            <View style={[styles.alertIcon, { backgroundColor: '#f44336' }]}>
              <Ionicons name="warning-outline" size={20} color="#fff" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>{lowStockProducts} Low Stock Items</Text>
              <Text style={styles.alertSubtitle}>Consider restocking soon</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={action.icon} size={28} color="#4CAF50" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.recentOrdersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AdminOrders')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {orders.slice(0, 5).map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.orderItem}
            onPress={() => navigation.navigate('AdminOrderDetails', { orderId: order.id })}
          >
            <View>
              <Text style={styles.orderId}>Order #{order.id}</Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={styles.orderTotal}>${order.total.toFixed(2)}</Text>
              <View style={[styles.statusBadge, { 
                backgroundColor: order.status === 'pending' ? '#FF9800' : 
                                 order.status === 'processing' ? '#2196F3' :
                                 order.status === 'shipped' ? '#9C27B0' :
                                 order.status === 'delivered' ? '#4CAF50' : '#666'
              }]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {orders.length === 0 && (
          <View style={styles.emptyOrders}>
            <Ionicons name="receipt-outline" size={40} color="#ddd" />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  adminName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    padding: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    marginTop: -20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: '1%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  alertsSection: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  alertSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quickActionsSection: {
    padding: 15,
    paddingTop: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
  },
  recentOrdersSection: {
    padding: 15,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  emptyOrders: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
});
