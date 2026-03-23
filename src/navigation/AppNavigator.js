import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import { useSelector } from 'react-redux';
import { CustomTabBar } from './CustomTabBar';

// User Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LandingScreen from '../screens/auth/LandingScreen';
import HomeScreen from '../screens/user/HomeScreen';
import ProductDetailsScreen from '../screens/user/ProductDetailsScreen';
import SearchScreen from '../screens/user/SearchScreen';
import CategoriesScreen from '../screens/user/CategoriesScreen';
import CartScreen from '../screens/user/CartScreen';
import CheckoutScreen from '../screens/user/CheckoutScreen';
import OrderHistoryScreen from '../screens/user/OrderHistoryScreen';
import OrderDetailsScreen from '../screens/user/OrderDetailsScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import EditProfileScreen from '../screens/user/EditProfileScreen';
import ReviewsScreen from '../screens/user/ReviewsScreen';
import NotificationDetailsScreen from '../screens/user/NotificationDetailsScreen';
import AboutScreen from '../screens/user/AboutScreen';
import HelpSupportScreen from '../screens/user/HelpSupportScreen';
import NotificationsScreen from '../screens/user/NotificationsScreen';
import SecurityScreen from '../screens/user/SecurityScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminProductsScreen from '../screens/admin/AdminProductsScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminShippingScreen from '../screens/admin/AdminShippingScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminPromoCodesScreen from '../screens/admin/AdminPromoCodesScreen';
import AdminReviewsScreen from '../screens/admin/AdminReviewsScreen';

// Navigation Components
import CustomDrawerContent from './CustomDrawer';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// User Tab Navigator
function UserTabs() {
  const cartCount = useSelector(state => state.cart.items.reduce((count, item) => count + item.quantity, 0));
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Shop') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Orders') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#000000',
      })}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Shop" component={HomeScreen} options={{ headerTitle: () => <Image source={require('../../images/Logo_title-removebg-preview.png')} style={{ width: 120, height: 40, resizeMode: 'contain' }} /> }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ headerTitle: () => <Image source={require('../../images/Logo_title-removebg-preview.png')} style={{ width: 120, height: 40, resizeMode: 'contain' }} /> }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ headerTitle: () => <Image source={require('../../images/Logo_title-removebg-preview.png')} style={{ width: 120, height: 40, resizeMode: 'contain' }} />, tabBarBadge: cartCount > 0 ? cartCount : null }} />
      <Tab.Screen name="Orders" component={OrderHistoryScreen} options={{ headerTitle: () => <Image source={require('../../images/Logo_title-removebg-preview.png')} style={{ width: 120, height: 40, resizeMode: 'contain' }} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerTitle: () => <Image source={require('../../images/Logo_title-removebg-preview.png')} style={{ width: 120, height: 40, resizeMode: 'contain' }} /> }} />
    </Tab.Navigator>
  );
}

// User Drawer Navigator
function UserDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#FF8C42' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        drawerActiveTintColor: '#FF8C42',
        drawerInactiveTintColor: '#4B5563',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: '75%',
        },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={UserTabs}
        options={{
          headerShown: false,
          drawerLabel: 'Home',
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Orders"
        component={OrderHistoryScreen}
        options={{
          drawerLabel: 'My Orders',
          drawerIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{
          drawerLabel: 'My Reviews',
          drawerIcon: ({ color, size }) => <Ionicons name="star-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          drawerLabel: 'Edit Profile',
          drawerIcon: ({ color, size }) => <Ionicons name="pencil-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

// Auth Stack Navigator
function AuthStack() {
  const showLanding = useSelector(state => state.auth.showLanding);
  
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
      initialRouteName={showLanding ? 'Landing' : 'Login'}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// User Stack Navigator (for modal screens)
function UserStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="UserDrawer" component={UserDrawer} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
        <Stack.Screen name="ProductReviews" component={ReviewsScreen} options={{ title: 'Product Reviews' }} />
        <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categories' }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Checkout' }} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
        <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen} options={{ title: 'Notification' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About FitSphere' }} />
        <Stack.Screen name="Help" component={HelpSupportScreen} options={{ title: 'Help & Support' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Security" component={SecurityScreen} options={{ title: 'Security' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

// Admin Drawer Navigator
function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#4B5563' },
        headerTintColor: 'white',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        drawerActiveTintColor: '#FF8C42',
        drawerInactiveTintColor: '#4B5563',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: '75%',
        },
      }}
    >
      <Drawer.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          drawerLabel: 'Dashboard',
          drawerIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          drawerLabel: 'Users',
          drawerIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminProducts"
        component={AdminProductsScreen}
        options={{
          drawerLabel: 'Products',
          drawerIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminCategories"
        component={AdminCategoriesScreen}
        options={{
          drawerLabel: 'Categories',
          drawerIcon: ({ color, size }) => <Ionicons name="apps-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{
          drawerLabel: 'Orders',
          drawerIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminPromoCodes"
        component={AdminPromoCodesScreen}
        options={{
          drawerLabel: 'Promos',
          drawerIcon: ({ color, size }) => <Ionicons name="gift-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminReviews"
        component={AdminReviewsScreen}
        options={{
          drawerLabel: 'Reviews',
          drawerIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminShipping"
        component={AdminShippingScreen}
        options={{
          drawerLabel: 'Shipping',
          drawerIcon: ({ color, size }) => <Ionicons name="car-outline" size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{
          drawerLabel: 'Activities',
          drawerIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

// Admin Stack Navigator (for modal screens)
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Group>
        <Stack.Screen name="AdminNest" component={AdminDrawer} />
      </Stack.Group>
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen name="AdminOrderDetails" component={OrderDetailsScreen} options={{ title: 'Order Details' }} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  return (
    <Stack.Navigator screenOptions={{ 
      headerShown: false,
      animationEnabled: true,
    }}>
      {!isAuthenticated ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthStack}
          options={{
            animationEnabled: true,
          }}
        />
      ) : user?.role === 'admin' ? (
        <Stack.Screen name="AdminStack" component={AdminStack} />
      ) : (
        <Stack.Screen name="UserStack" component={UserStack} />
      )}
    </Stack.Navigator>
  );
}
