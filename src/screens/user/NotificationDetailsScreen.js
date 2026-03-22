import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationDetailsScreen({ route, navigation }) {
  const { title, body, data } = route.params || {};
  const [copied, setCopied] = useState(false);

  const createdAt = new Date().toLocaleString();
  const isPromotion = data?.type === 'promotion';

  const handleCopyCode = () => {
    if (data?.promoCode) {
      // In a real app, use Clipboard API
      Alert.alert('Copied!', `Promo code "${data.promoCode}" copied to clipboard`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyPromo = () => {
    if (data?.promoCode) {
      navigation.navigate('UserDrawer', { screen: 'Home', params: { screen: 'Cart' } });
      Alert.alert('Go to Cart', `The promo code ${data.promoCode} is ready to apply!`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconWrap, isPromotion && styles.promoIcon]}>
          <Ionicons 
            name={isPromotion ? 'gift' : 'notifications'} 
            size={28} 
            color={isPromotion ? '#FF8C42' : '#000'} 
          />
        </View>
        
        <Text style={styles.title}>{title || 'Notification'}</Text>
        <Text style={styles.body}>{body || 'You have a new update from FitSphere.'}</Text>
        
        {/* Promo Code Section */}
        {isPromotion && data?.promoCode && (
          <View style={styles.promoSection}>
            <View style={styles.promoCodeBox}>
              <Text style={styles.promoLabel}>Your Promo Code</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.promoCode}>{data.promoCode}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyCode}>
                  <Ionicons name={copied ? 'checkmark' : 'copy'} size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {data?.discount && (
              <View style={styles.discountInfo}>
                <Ionicons name="percent" size={20} color="#10b981" />
                <Text style={styles.discountText}>{data.discount}% Discount</Text>
              </View>
            )}

            {data?.description && (
              <Text style={styles.description}>{data.description}</Text>
            )}
          </View>
        )}

        <Text style={styles.meta}>Received: {createdAt}</Text>

        <View style={styles.buttonContainer}>
          {isPromotion ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleApplyPromo}
              >
                <Ionicons name="cart-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.buttonText}>Apply in Cart</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('UserDrawer', { screen: 'Home', params: { screen: 'Orders' } })}
            >
              <Text style={styles.buttonText}>Go To Orders</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  promoIcon: {
    backgroundColor: '#fff3e0',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  promoSection: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C42',
  },
  promoLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: '#FF8C42',
  },
  promoCode: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF8C42',
    letterSpacing: 2,
  },
  copyButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF8C42',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 10,
  },
  discountText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 10,
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  meta: {
    fontSize: 12,
    color: '#999',
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: '#FF8C42',
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 14,
  },
});
