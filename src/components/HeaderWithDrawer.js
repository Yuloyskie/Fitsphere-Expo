import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const HeaderWithDrawer = (navigation, title, rightIcon = null, onRightPress = null) => {
  return {
    headerLeft: () => (
      <TouchableOpacity
        style={styles.headerButton}
        onPress={() => navigation.toggleDrawer()}
      >
        <Ionicons name="menu" size={24} color="white" />
      </TouchableOpacity>
    ),
    headerRight: rightIcon
      ? () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={onRightPress}
          >
            <Ionicons name={rightIcon} size={24} color="white" />
          </TouchableOpacity>
        )
      : undefined,
    headerTitle: () => (
      <Text style={styles.headerTitle}>{title}</Text>
    ),
    headerStyle: styles.header,
    headerTitleAlign: 'center',
  };
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FF8C42',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

export default HeaderWithDrawer;
