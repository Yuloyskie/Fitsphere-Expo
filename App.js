import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { loadCart } from './src/store/slices/cartSlice';
import { loadUser } from './src/store/slices/authSlice';
import { fetchOrders, fetchAllOrders, clearOrders } from './src/store/slices/orderSlice';
import { addNotification } from './src/store/slices/notificationSlice';
import notificationService from './src/services/NotificationService';

const navigationRef = createNavigationContainerRef();

const handleNotificationResponse = (response, dispatch) => {
  const data = response?.notification?.request?.content?.data || {};
  const title = response?.notification?.request?.content?.title || 'Notification';
  const body = response?.notification?.request?.content?.body || 'You have a new notification';

  // Add notification to Redux store
  dispatch(addNotification({
    title,
    body,
    ...data,
  }));

  if (!navigationRef.isReady()) {
    return;
  }

  if (data.orderId) {
    navigationRef.navigate('UserStack', {
      screen: 'OrderDetails',
      params: { orderId: data.orderId },
    });
    return;
  }

  navigationRef.navigate('UserStack', {
    screen: 'NotificationDetails',
    params: {
      title,
      body,
      data,
    },
  });
};

function AppContent() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  // Initial app setup
  useEffect(() => {
    dispatch(loadCart());
    dispatch(loadUser());

    let responseSubscription;
    let receivedSubscription;

    // Handle notification response (when user taps notification)
    notificationService.addNotificationResponseReceivedListener((response) => {
      handleNotificationResponse(response, dispatch);
    }).then((subscription) => {
      responseSubscription = subscription;
    });

    // Handle notification received (when app is in foreground)
    notificationService.addNotificationReceivedListener((notification) => {
      const data = notification?.request?.content?.data || {};
      const title = notification?.request?.content?.title || 'Notification';
      const body = notification?.request?.content?.body || 'You have a new notification';
      
      // Add notification to Redux store
      dispatch(addNotification({
        title,
        body,
        ...data,
      }));
    }).then((subscription) => {
      receivedSubscription = subscription;
    });

    notificationService.getLastNotificationResponse().then((response) => {
      if (response) {
        handleNotificationResponse(response, dispatch);
      }
    });

    return () => {
      if (responseSubscription?.remove) {
        responseSubscription.remove();
      }
      if (receivedSubscription?.remove) {
        receivedSubscription.remove();
      }
    };
  }, [dispatch]);

  // Fetch orders when user logs in/out
  useEffect(() => {
    if (user?.id) {
      // User is logged in - fetch their orders based on role
      if (user.role === 'admin') {
        // Admins see all orders with filters available
        dispatch(fetchAllOrders({}));
      } else {
        // Regular users see only their own orders
        dispatch(fetchOrders(user.id));
      }
    } else {
      // User is logged out - clear orders state
      dispatch(clearOrders());
    }
  }, [user?.id, user?.role, dispatch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="light" backgroundColor="#000000" />
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
