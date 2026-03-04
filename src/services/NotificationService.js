import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Request permissions for push notifications
  requestPermissions: async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push notification permissions');
      return false;
    }
    
    return true;
  },

  // Get the push notification token
  getPushToken: async () => {
    try {
      const hasPermission = await notificationService.requestPermissions();
      if (!hasPermission) return null;

      const { data: token } = await Notifications.getExpoPushTokenAsync();
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  },

  // Save push token to user model (stored locally)
  savePushToken: async (token) => {
    try {
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

  // Remove stale push token
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
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Send immediately
    });
  },

  // Schedule a notification for promotions
  schedulePromotionNotification: async (title, body, secondsFromNow = 60) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: {
        seconds: secondsFromNow,
      },
    });
  },

  // Cancel all scheduled notifications
  cancelAllNotifications: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Add notification received listener
  addNotificationReceivedListener: (callback) => {
    return Notifications.addNotificationReceivedListener(callback);
  },

  // Add notification response listener (when user taps notification)
  addNotificationResponseReceivedListener: (callback) => {
    return Notifications.addNotificationResponseReceivedListener(callback);
  },
};

export default notificationService;
