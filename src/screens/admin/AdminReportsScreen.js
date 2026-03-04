import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

export default function AdminReportsScreen({ navigation }) {
  const orders = useSelector(state => state.orders.orders);
  const products = useSelector(state => state.products.products);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const periods = [
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'quarter', label: 'This Quarter' },
    { id: 'year', label: 'This Year' },
  ];

  // Calculate metrics
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  // Mock data for charts - in real app would use a chart library
  const topSellingProducts = [
    { id: '1', name: 'Adjustable Dumbbell Set', sales: 145, revenue: 14455.55 },
    { id: '2', name: 'Resistance Bands Set', sales: 132, revenue: 3956.68 },
    { id: '3', name: 'Yoga Mat Premium', sales: 98, revenue: 4802.02 },
    { id: '4', name: 'Weight Bench', sales: 87, revenue: 12165.63 },
    { id: '5', name: 'Kettlebell 20kg', sales: 76, revenue: 6080.24 },
  ];

  const salesByCategory = [
    { category: 'Strength Training', percentage: 45, color: '#4CAF50' },
    { category: 'Cardio', percentage: 25, color: '#2196F3' },
    { category: 'Accessories', percentage: 15, color: '#FF9800' },
    { category: 'Recovery', percentage: 10, color: '#9C27B0' },
    { category: 'Other', percentage: 5, color: '#607D8B' },
  ];

  const recentTransactions = [
    { id: 'TRX001', date: '2024-01-15', amount: 259.99, status: 'Completed', paymentMethod: 'Credit Card' },
    { id: 'TRX002', date: '2024-01-14', amount: 149.99, status: 'Completed', paymentMethod: 'PayPal' },
    { id: 'TRX003', date: '2024-01-14', amount: 89.99, status: 'Pending', paymentMethod: 'Credit Card' },
    { id: 'TRX004', date: '2024-01-13', amount: 399.99, status: 'Completed', paymentMethod: 'Apple Pay' },
    { id: 'TRX005', date: '2024-01-13', amount: 79.99, status: 'Refunded', paymentMethod: 'Google Pay' },
  ];

  const handleGenerateReport = () => {
    Alert.alert('Generate Report', 'Report generation functionality would create a PDF/Excel report.');
  };

  const handleExportReceipt = (transactionId) => {
    Alert.alert('Export Receipt', `Receipt for ${transactionId} would be exported.`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports & Analytics</Text>
        <TouchableOpacity style={styles.exportButton} onPress={handleGenerateReport}>
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.exportButtonText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[styles.periodChip, selectedPeriod === period.id && styles.periodChipActive]}
            onPress={() => setSelectedPeriod(period.id)}
          >
            <Text style={[styles.periodText, selectedPeriod === period.id && styles.periodTextActive]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#e8f5e9' }]}>
            <Ionicons name="cash" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.metricValue}>${totalRevenue.toFixed(2)}</Text>
          <Text style={styles.metricLabel}>Total Revenue</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#e3f2fd' }]}>
            <Ionicons name="receipt" size={24} color="#2196F3" />
          </View>
          <Text style={styles.metricValue}>{totalOrders}</Text>
          <Text style={styles.metricLabel}>Total Orders</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="pricetag" size={24} color="#FF9800" />
          </View>
          <Text style={styles.metricValue}>${averageOrderValue.toFixed(2)}</Text>
          <Text style={styles.metricLabel}>Avg. Order Value</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={[styles.metricIcon, { backgroundColor: '#f3e5f5' }]}>
            <Ionicons name="cube" size={24} color="#9C27B0" />
          </View>
          <Text style={styles.metricValue}>{totalProducts}</Text>
          <Text style={styles.metricLabel}>Total Products</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        <View style={styles.topProductsList}>
          {topSellingProducts.map((product, index) => (
            <View key={product.id} style={styles.topProductItem}>
              <Text style={styles.topProductRank}>{index + 1}</Text>
              <View style={styles.topProductInfo}>
                <Text style={styles.topProductName} numberOfLines={1}>{product.name}</Text>
                <Text style={styles.topProductSales}>{product.sales} sales</Text>
              </View>
              <Text style={styles.topProductRevenue}>${product.revenue.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sales by Category</Text>
        {salesByCategory.map((item, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
              <Text style={styles.categoryName}>{item.category}</Text>
            </View>
            <View style={styles.categoryBarContainer}>
              <View style={[styles.categoryBar, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
            </View>
            <Text style={styles.categoryPercentage}>{item.percentage}%</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionsList}>
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionId}>{transaction.id}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <View style={styles.transactionMiddle}>
                <Text style={styles.transactionMethod}>{transaction.paymentMethod}</Text>
                <View style={[styles.statusBadge, { 
                  backgroundColor: transaction.status === 'Completed' ? '#e8f5e9' : 
                                  transaction.status === 'Pending' ? '#fff3e0' : '#ffebee'
                }]}>
                  <Text style={[styles.statusText, { 
                    color: transaction.status === 'Completed' ? '#4CAF50' : 
                           transaction.status === 'Pending' ? '#FF9800' : '#f44336'
                  }]}>
                    {transaction.status}
                  </Text>
                </View>
              </View>
              <View style={styles.transactionRight}>
                <Text style={styles.transactionAmount}>${transaction.amount.toFixed(2)}</Text>
                <TouchableOpacity onPress={() => handleExportReceipt(transaction.id)}>
                  <Ionicons name="receipt-outline" size={18} color="#2196F3" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory Alerts</Text>
        <View style={styles.alertCard}>
          <View style={[styles.alertIcon, { backgroundColor: '#ffebee' }]}>
            <Ionicons name="warning" size={24} color="#f44336" />
          </View>
          <View style={styles.alertInfo}>
            <Text style={styles.alertTitle}>{lowStockProducts} Products Low on Stock</Text>
            <Text style={styles.alertSubtitle}>Consider restocking soon to avoid stockouts</Text>
          </View>
          <TouchableOpacity 
            style={styles.alertButton}
            onPress={() => navigation.navigate('AdminProducts')}
          >
            <Text style={styles.alertButtonText}>View</Text>
          </TouchableOpacity>
        </View>
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
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  periodSelector: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 3,
  },
  periodChipActive: {
    backgroundColor: '#4CAF50',
  },
  periodText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#fff',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    margin: '1%',
    alignItems: 'center',
  },
  metricIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    marginTop: 0,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  topProductsList: {
    marginTop: -5,
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topProductRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  topProductInfo: {
    flex: 1,
  },
  topProductName: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  topProductSales: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  topProductRevenue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryInfo: {
    width: 120,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 12,
    color: '#212121',
  },
  categoryBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  categoryBar: {
    height: '100%',
    borderRadius: 4,
  },
  categoryPercentage: {
    width: 40,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  transactionsList: {
    marginTop: -5,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionInfo: {
    width: 80,
  },
  transactionId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  transactionDate: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  transactionMiddle: {
    flex: 1,
  },
  transactionMethod: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    marginRight: 10,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 15,
  },
  alertIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertInfo: {
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
  alertButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
