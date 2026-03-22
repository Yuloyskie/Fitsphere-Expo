import React, { useRef } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const CustomTabBar = ({ state, descriptors, navigation }) => {
  const animatedScales = useRef(
    state.routes.map(() => useSharedValue(1))
  ).current;

  const animatedGlows = useRef(
    state.routes.map(() => useSharedValue(0))
  ).current;

  const handleTabPress = (index, routeName) => {
    // Pop animation sequence
    animatedScales[index].value = withSequence(
      withSpring(1.3), // Expand
      withSpring(0.9), // Pop back
      withSpring(1.1), // Bounce slightly
      withSpring(1)    // Settle
    );

    // Glow animation
    animatedGlows[index].value = withSequence(
      withSpring(1), // Glow up
      withSpring(0)  // Glow down
    );

    // Navigate
    navigation.navigate(routeName);
  };

  const getIconName = (routeName, focused) => {
    switch (routeName) {
      case 'Shop':
        return focused ? 'home' : 'home-outline';
      case 'Search':
        return focused ? 'search' : 'search-outline';
      case 'Cart':
        return focused ? 'cart' : 'cart-outline';
      case 'Orders':
        return focused ? 'list' : 'list-outline';
      case 'Profile':
        return focused ? 'person' : 'person-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = options.tabBarLabel || route.name;

          const animatedScaleStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: animatedScales[index].value }],
            };
          });

          const animatedGlowStyle = useAnimatedStyle(() => {
            const glowOpacity = animatedGlows[index].value;
            return {
              opacity: glowOpacity,
              shadowOpacity: interpolate(glowOpacity, [0, 1], [0, 0.8]),
              shadowRadius: interpolate(glowOpacity, [0, 1], [0, 15]),
            };
          });

          const tabBackgroundColor = isFocused ? '#FF8C42' : '#ffffff';
          const tabIconColor = isFocused ? '#ffffff' : '#999999';
          const glowColor = isFocused ? '#FF8C42' : 'rgba(255, 140, 66, 0)';

          return (
            <View key={route.key} style={styles.tabWrapper}>
              {/* Glow Background */}
              <Animated.View
                style={[
                  styles.glowEffect,
                  animatedGlowStyle,
                  {
                    borderColor: glowColor,
                    backgroundColor: `rgba(255, 140, 66, ${
                      isFocused ? 0.2 : 0
                    })`,
                  },
                ]}
              />

              {/* Tab Button */}
              <AnimatedTouchable
                style={[
                  styles.tabButton,
                  animatedScaleStyle,
                  {
                    backgroundColor: tabBackgroundColor,
                    borderColor: isFocused ? '#FF8C42' : '#e0e0e0',
                  },
                ]}
                onPress={() => handleTabPress(index, route.name)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={getIconName(route.name, isFocused)}
                  size={24}
                  color={tabIconColor}
                  style={styles.icon}
                />
              </AnimatedTouchable>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    paddingBottom: 5,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    paddingVertical: 8,
  },
  tabWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%',
    height: '100%',
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  glowEffect: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    shadowColor: '#FF8C42',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  icon: {
    fontWeight: '600',
  },
});
