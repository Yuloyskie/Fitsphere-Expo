import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const notificationTypes = [
    {
      id: 1,
      title: 'Order Processed',
      description: 'You will receive a notification when your order has been processed and is being prepared for shipment.',
      icon: 'checkmark-circle-outline',
    },
    {
      id: 2,
      title: 'Order Shipped',
      description: 'A notification will be sent as soon as your order ships. This notification will include a tracking number so you can monitor your delivery in real-time.',
      icon: 'cube-outline',
    },
    {
      id: 3,
      title: 'Order Delivered',
      description: 'You will receive a notification confirming that your order has been successfully delivered to your address.',
      icon: 'checkmark-done-outline',
    },
    {
      id: 4,
      title: 'Promotional Offers',
      description: 'Get notified about special deals, seasonal sales, and exclusive promotions tailored to your interests.',
      icon: 'gift-outline',
    },
    {
      id: 5,
      title: 'Product Reviews',
      description: 'Receive reminders to review products you have purchased. Your feedback helps other customers make informed decisions.',
      icon: 'star-outline',
    },
    {
      id: 6,
      title: 'Stock Alerts',
      description: 'Get notified when out-of-stock items are back in stock. Never miss your favorite products again.',
      icon: 'alert-circle-outline',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Notifications</Text>
        
        <View style={styles.introSection}>
          <Text style={styles.introText}>
            Stay updated with important information about your orders, promotions, and more. Here are the types of notifications you will receive:
          </Text>
        </View>

        <View style={styles.notificationsList}>
          {notificationTypes.map((notification) => (
            <View key={notification.id} style={styles.notificationItem}>
              <View style={styles.iconContainer}>
                <Ionicons name={notification.icon} size={28} color="#FF8C42" />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationDescription}>{notification.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Managing Your Notifications</Text>
          <Text style={styles.infoText}>
            You can manage your notification preferences in your account settings. Choose which types of notifications you want to receive and how frequently you'd like to be notified.
          </Text>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips</Text>
          <Text style={styles.tipText}>
            - Enable push notifications to get timely updates about your orders
          </Text>
          <Text style={styles.tipText}>
            - Check the notification details screen for more information or actions
          </Text>
          <Text style={styles.tipText}>
            - Visit "My Orders" to see the full history of your order statuses
          </Text>
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
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  introSection: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333333',
  },
  notificationsList: {
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    margdinBottom: 12,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 15,
    marginTop: 5,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  infoSection: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C42',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF8C42',
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
});
