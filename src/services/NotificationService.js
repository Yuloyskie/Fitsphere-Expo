import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const isExpoGo =
  Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';

let notificationsModule = null;

const getNotificationsModule = async () => {
  if (isExpoGo) {
    return null;
  }

  if (!notificationsModule) {
    const imported = await import('expo-notifications');
    notificationsModule = imported;

    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  }

  return notificationsModule;
};

export const notificationService = {
  // Request permissions for push notifications
  requestPermissions: async () => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return false;
    }

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
      if (isExpoGo) {
        return null;
      }

      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        return null;
      }

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
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return;
    }

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
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return;
    }

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
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  // Add notification received listener
  addNotificationReceivedListener: async (callback) => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return { remove: () => {} };
    }

    return Notifications.addNotificationReceivedListener(callback);
  },

  // Add notification response listener (when user taps notification)
  addNotificationResponseReceivedListener: async (callback) => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return { remove: () => {} };
    }

    return Notifications.addNotificationResponseReceivedListener(callback);
  },

  getLastNotificationResponse: async () => {
    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return null;
    }

    return Notifications.getLastNotificationResponseAsync();
  },
};

export default notificationService;
