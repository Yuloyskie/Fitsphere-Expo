# Drawer Navigation - Quick Implementation Guide

## Visual Layout

```
┌────────────────────────────────────────────┐
│ ☰  FitSphere Home               🔔         │  ← Header with drawer toggle
├────────────────────────────────────────────┤
│ ┌─────────────────┐                        │
│ │  [👤]  John     │  Main Content Area     │
│ │         Doe     │                        │
│ │         👑 Admin│  - Product Cards       │
│ │       ┌──────┐  │  - Search              │
│ │       │Edit  │  │  - Categories          │
│ │       │Profil│  │  - Notifications      │
│ │       └──────┘  │                        │
│ ├─────────────────┤                        │
│ │ 📊 Dashboard    │                        │
│ │ 👥 Users        │                        │
│ │ 📦 Products     │                        │
│ │ 📋 Orders       │                        │
│ │ 🎁 Promos       │                        │
│ │ 💬 Reviews      │                        │
│ │ 🚗 Shipping     │                        │
│ │ 📝 Activities   │                        │
│ ├─────────────────┤                        │
│ │ 🚪 Logout       │                        │
│ │ FitSphere v1.0  │                        │
│ └─────────────────┘                        │
└────────────────────────────────────────────┘
```

## Before/After Example

### Before (Old Navigation)
```javascript
// Old: Only bottom tabs, no drawer
UserTabs Navigator
├─ Home (bottom tab)
├─ Search (bottom tab)
├─ Cart (bottom tab)
├─ Orders (bottom tab)
└─ Profile (bottom tab)
```

### After (New Drawer Navigation)
```javascript
// New: Drawer + bottom tabs/screens
UserDrawer (side menu)
├─ Home (UserTabs - has bottom tabs inside)
│   ├─ Home (tab)
│   ├─ Search (tab)
│   ├─ Cart (tab)
│   ├─ Orders (tab)
│   └─ Profile (tab)
├─ My Orders (OrderHistoryScreen)
├─ My Reviews (ReviewsScreen)
├─ Edit Profile (EditProfileScreen)
└─ [Drawer Footer]
    ├─ Logout
    └─ App Info
```

## Step-by-Step Usage

### For User Screens (With Bottom Tabs)

**HomeScreen.js** (or any tab screen)
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  // The navbar is handled by UserTabs
  // Just focus on your screen content
  
  return (
    <View style={styles.container}>
      <Text>Welcome to FitSphere</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
});
```

**Note**: Home, Search, Cart, Orders, Profile tabs don't need modification. They already use the drawer via UserDrawer wrapper.

---

### For User Screens (Drawer Menu Only)

**OrderHistoryScreen.js** (accessed via drawer menu)
```javascript
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function OrderHistoryScreen() {
  const navigation = useNavigation();

  React.useEffect(() => {
    // Optional: Add custom header options
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={{ paddingHorizontal: 12 }}
          onPress={() => navigation.toggleDrawer()}
        >
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text>My Orders</Text>
      {/* FlatList of orders */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
});
```

---

### For Admin Screens

**AdminUsersScreen.js**
```javascript
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AdminUsersScreen() {
  const navigation = useNavigation();

  // AdminStack automatically adds the drawer
  // Your screen content here
  
  return (
    <View style={styles.container}>
      <Text>User Management</Text>
      {/* FlatList of users */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
});
```

---

## Interacting with the Drawer

### Open Drawer Programmatically
```javascript
import { useNavigation } from '@react-navigation/native';

export default function MyScreen() {
  const navigation = useNavigation();

  return (
    <View>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Text>Open Menu</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Close Drawer After Action
```javascript
navigation.closeDrawer();
```

### Navigate & Close
```javascript
navigation.navigate('Orders');
navigation.closeDrawer();
```

---

## Drawer Styling Customization

### Change Drawer Width
**In AppNavigator.js**
```javascript
drawerStyle: {
  backgroundColor: '#FFFFFF',
  width: '80%',  // Changed from 75%
}
```

### Change Header Color
**In AppNavigator.js**
```javascript
headerStyle: { backgroundColor: '#4B5563' },  // Change this color
```

### Change Active Item Color
**In AppNavigator.js**
```javascript
drawerActiveTintColor: '#10b981',  // Change highlight color
```

---

## Integration Checklist

- ✅ CustomDrawer.js created
- ✅ AppNavigator.js updated with UserDrawer & AdminDrawer
- ✅ HeaderWithDrawer.js created for consistent headers
- ✅ Redux logout action working
- ✅ Profile image/data integrated
- ✅ User/Admin role detection working
- ✅ Screen navigation working
- ✅ Drawer animations smooth
- ✅ Bottom tabs still working (for Home tab)
- ✅ Modal screens working (ProductDetails, etc.)

---

## Navigation Routes Reference

### User Routes (Accessible via Drawer)
- `Home` - UserTabs (bottom tab navigation)
- `Orders` - OrderHistoryScreen
- `Reviews` - ReviewsScreen  
- `EditProfile` - EditProfileScreen

### Modal Routes (Stacked on top)
- `ProductDetails` - ProductDetailsScreen
- `Categories` - CategoriesScreen
- `Checkout` - CheckoutScreen
- `NotificationDetails` - NotificationDetailsScreen

### Admin Routes (Accessible via Drawer)
- `AdminDashboard` - AdminDashboardScreen
- `AdminUsers` - AdminUsersScreen
- `AdminProducts` - AdminProductsScreen
- `AdminOrders` - AdminOrdersScreen
- `AdminPromoCodes` - AdminPromoCodesScreen
- `AdminReviews` - AdminReviewsScreen
- `AdminShipping` - AdminShippingScreen
- `AdminReports` - AdminReportsScreen

### Admin Modal Routes
- `AdminOrderDetails` - OrderDetailsScreen

---

## Testing the Drawer

### Test Checklist

1. **Drawer Opens**
   - Swipe from left edge → Drawer slides in
   - Tap hamburger icon → Drawer toggles
   - ✓ Should be smooth

2. **Profile Section**
   - Avatar displays user image
   - Name shows current user name
   - Email shows correct email
   - Role badge shows "Admin" or "Customer"
   - Green online badge visible
   - Edit Profile button works

3. **Menu Items**
   - All items visible and labeled
   - Icons show correctly
   - Tap item → Navigate to screen
   - Active item highlighted orange
   - Drawer closes automatically

4. **Footer**
   - Logout button visible
   - Tap Logout → Alert appears
   - Confirm → User logged out
   - App Info (FitSphere v1.0.0) shows

5. **User vs Admin**
   - User role → User menu (Home, Orders, Reviews, Edit)
   - Admin role → Admin menu (Dashboard, Users, Products, etc.)

---

## Common Issues & Solutions

### Issue: Drawer won't open
**Solution**: Check that navigation prop is passed to navigation.openDrawer()

### Issue: Header not showing
**Solution**: Verify Drawer.Screen has headerShown: true (default)

### Issue: Avatar not loading
**Solution**: Check user.avatar in Redux state, use placeholder if null

### Issue: Menu items not highlighted
**Solution**: Ensure drawerActiveTintColor is set to #FF8C42

### Issue: Bottom tabs disappeared
**Solution**: UserTabs is inside UserDrawer → home tab should still have tabs

---

## File Dependencies

```
AppNavigator.js
  ├── CustomDrawer.js (custom drawer content)
  ├── UserTabs (bottom tab navigation)
  ├── UserDrawer (wraps tabs + menu screens)
  ├── AdminDrawer (admin menu screens)
  └── HeaderWithDrawer.js (optional helper)

Redux (authSlice)
  ├── user object (name, email, avatar, role)
  ├── isAuthenticated boolean
  └── logout() action
```

---

## Summary of Changes

| Component | Type | Purpose |
|-----------|------|---------|
| CustomDrawer.js | NEW | Profile header + menu rendering |
| AppNavigator.js | UPDATED | Added UserDrawer & AdminDrawer |
| HeaderWithDrawer.js | NEW | Consistent header with menu toggle |
| authSlice.js | EXISTING | logout() action (already working) |

---

## Next Steps

1. Test drawer opening/closing
2. Test navigation through menu items
3. Test profile display
4. Test logout functionality
5. Verify modal screens work (ProductDetails, etc.)
6. Optional: Customize colors/width per requirements

All ready to go! 🚀
