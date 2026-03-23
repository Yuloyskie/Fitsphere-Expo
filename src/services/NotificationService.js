import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Only set notification handler if not in Expo Go (to avoid the warning)
if (!isExpoGo) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export const notificationService = {
  // Initialize notification listeners
  initializeNotifications: async () => {
    try {
      if (isExpoGo) {
        console.log('✅ Running in Expo Go - notifications will work in production APK');
        return true;
      }

      // Request permissions first
      await notificationService.requestPermissions();

      // Register for push notifications
      if (Device.isDevice) {
        const token = await notificationService.getPushToken();
        if (token) {
          await notificationService.savePushToken(token);
          console.log('✅ Push token obtained:', token?.slice(0, 20) + '...');
        }
      }

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  },

  // Request permissions for push notifications
  requestPermissions: async () => {
    try {
      // Skip permission request in Expo Go
      if (isExpoGo) {
        return true;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Notification permissions not granted');
        return false;
      }

      console.log('✅ Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  },

  // Get the push notification token
  getPushToken: async () => {
    try {
      if (!Device.isDevice) {
        console.log('ℹ️ Not a physical device - push notifications may not work');
        return null;
      }
      // Skip in Expo Go - just return null to avoid warning
      if (isExpoGo) {
        console.log('ℹ️  Expo Go mode - push notifications will work in production APK');
        return null;
      }
      const token = await Notifications.getExpoPushTokenAsync();
      return token.data;
    } catch (error) {
      console.error('❌ Error getting push token:', error);
      return null;
    }
  },

  // Save push token to local storage
  savePushToken: async (token) => {
    try {
      if (isExpoGo || !token) {
        return true;
      }
      await AsyncStorage.setItem('pushToken', token);
      return true;
    } catch (error) {
      console.error('Error saving push token:', error);
      return false;
    }
  },

  // Get saved push token
  getSavedPushToken: async () => {
    try {
      return await AsyncStorage.getItem('pushToken');
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  // Remove push token
  removePushToken: async () => {
    try {
      await AsyncStorage.removeItem('pushToken');
      return true;
    } catch (error) {
      console.error('Error removing push token:', error);
      return false;
    }
  },

  // Send a local notification (for testing)
  sendLocalNotification: async (title, body, data = {}) => {
    try {
      if (isExpoGo) {
        console.log('📱 [Expo Go] Would send notification:', title);
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          badge: 1,
        },
        trigger: null, // Send immediately
      });
      console.log('✅ Local notification sent:', title);
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  },

  // Schedule a notification
  scheduleNotification: async (title, body, data = {}, secondsFromNow = 5) => {
    try {
      if (isExpoGo) {
        console.log('📱 [Expo Go] Would schedule notification:', title);
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
          badge: 1,
        },
        trigger: {
          seconds: secondsFromNow,
        },
      });
      console.log('✅ Notification scheduled:', title);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  },

  // Schedule a promotion notification
  schedulePromotionNotification: async (title, body, secondsFromNow = 60) => {
    return notificationService.scheduleNotification(title, body, { type: 'promotion' }, secondsFromNow);
  },

  // Cancel all scheduled notifications
  cancelAllNotifications: async () => {
    try {
      if (isExpoGo) {
        return;
      }
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('✅ All scheduled notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  },

  // Add listener for notifications received in foreground
  addNotificationReceivedListener: (callback) => {
    if (isExpoGo) {
      // Return a dummy listener in Expo Go to avoid warnings
      return { remove: () => {} };
    }
    const listener = Notifications.addNotificationReceivedListener(callback);
    return listener;
  },

  // Add listener for notification responses (when user taps notification)
  addNotificationResponseListener: (callback) => {
    if (isExpoGo) {
      // Return a dummy listener in Expo Go to avoid warnings
      return { remove: () => {} };
    }
    const listener = Notifications.addNotificationResponseReceivedListener((response) => {
      const { title, body, data } = response.notification.request.content;
      callback({
        title,
        body,
        data,
      });
    });
    return listener;
  },

  // Get last notification response (for deep linking on app launch)
  getLastNotificationResponse: async () => {
    if (isExpoGo) {
      return null;
    }
    try {
      const response = await Notifications.getLastNotificationResponseAsync();
      if (response?.notification) {
        return {
          title: response.notification.request.content.title,
          body: response.notification.request.content.body,
          data: response.notification.request.content.data,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting last notification response:', error);
      return null;
    }
  },
};

export default notificationService;
