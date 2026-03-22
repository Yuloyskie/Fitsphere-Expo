import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../../store/slices/orderSlice';
import { clearCart, clearCartStorage } from '../../store/slices/cartSlice';
import { selectCartTotal } from '../../store/slices/cartSlice';
import { Ionicons } from '@expo/vector-icons';

export default function CheckoutScreen({ navigation }) {
  const dispatch = useDispatch();
  const cartItems = useSelector(state => state.cart.items);
  const cartTotal = useSelector(selectCartTotal);
  const cartDiscount = useSelector(state => state.cart.discount);
  const user = useSelector(state => state.auth.user);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });

  const [processing, setProcessing] = useState(false);

  const finalTotal = cartTotal - (cartTotal * cartDiscount / 100);

  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (let field of requiredFields) {
      if (!shippingInfo[field].trim()) {
        Alert.alert('Missing Information', `Please enter your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setProcessing(true);

    try {
      const userId = user?.id || 'guest';
      
      // Create order using the order slice
      const result = await dispatch(createOrder({ 
        order: {
          shippingInfo,
          subtotal: cartTotal,
          discount: cartDiscount,
          total: finalTotal,
        },
        userId 
      })).unwrap();

      // Clear cart from state and storage
      dispatch(clearCart());
      dispatch(clearCartStorage());

      Alert.alert(
        'Order Placed!',
        `Your order #${result.id} has been placed successfully. You will receive a confirmation email shortly.`,
        [
          { text: 'View Orders', onPress: () => navigation.navigate('UserDrawer', { screen: 'Home', params: { screen: 'Orders' } }) },
          { text: 'Continue Shopping', onPress: () => navigation.navigate('UserDrawer', { screen: 'Home', params: { screen: 'Shop' } }) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            placeholder="Enter your phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.address}
            onChangeText={(value) => handleInputChange('address', value)}
            placeholder="Enter your address"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              value={shippingInfo.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="City"
              placeholderTextColor="#999"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>State</Text>
            <TextInput
              style={styles.input}
              value={shippingInfo.state}
              onChangeText={(value) => handleInputChange('state', value)}
              placeholder="State"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>ZIP Code</Text>
          <TextInput
            style={styles.input}
            value={shippingInfo.zipCode}
            onChangeText={(value) => handleInputChange('zipCode', value)}
            placeholder="Enter ZIP code"
            placeholderTextColor="#999"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        {cartItems.map((item) => (
          <View key={`${item.product.id}-${item.size}`} style={styles.summaryItem}>
            <View style={styles.summaryItemInfo}>
              <Text style={styles.summaryItemName}>{item.product.name}</Text>
              <Text style={styles.summaryItemDetails}>Qty: {item.quantity} | Size: {item.size}</Text>
            </View>
            <Text style={styles.summaryItemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
        </View>

        {cartDiscount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount ({cartDiscount}%)</Text>
            <Text style={styles.summaryValueDiscount}>-${(cartTotal * cartDiscount / 100).toFixed(2)}</Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>Free</Text>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.placeOrderButton, processing && styles.placeOrderButtonDisabled]} 
        onPress={handlePlaceOrder}
        disabled={processing}
      >
        <Text style={styles.placeOrderButtonText}>
          {processing ? 'Processing...' : `Place Order - $${finalTotal.toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333333',
  },
  row: {
    flexDirection: 'row',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#333333',
  },
  summaryItemDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333333',
  },
  summaryValueDiscount: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  placeOrderButton: {
    backgroundColor: '#000000',
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#ccc',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
