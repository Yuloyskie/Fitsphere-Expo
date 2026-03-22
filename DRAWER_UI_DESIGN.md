# FitSphere Drawer Navigation UI Design

## Overview

A professional drawer-based navigation system with custom user profile header, smooth animations, and consistent orange/grey theming throughout the app.

**Location**: 
- CustomDrawer: `src/navigation/CustomDrawer.js`
- AppNavigator: `src/navigation/AppNavigator.js`
- HeaderComponent: `src/components/HeaderWithDrawer.js`

---

## Design Features

### 1. Custom Drawer Header (Profile Section)

**Colors & Styling**
- Background: Orange (#FF8C42)
- Profile Avatar: 70x70px with circular border
- Status Badge: Green (#10b981) animated indicator
- User Name: 16px bold white
- User Email: 13px light white
- Role Badge: Admin/Customer tag in semi-transparent badge

**Components**
```
┌─────────────────────────────────────┐
│  [Avatar]  User Name                │  ← Orange Header (#FF8C42)
│  (70x70)   user@email.com           │
│     ●●     👑 Admin / 👤 Customer   │
│            ┌──────────────────────┐ │
│            │  Edit Profile        │ │
│            └──────────────────────┘ │
└─────────────────────────────────────┘
```

**Avatar**
- Profile image from API or placeholder
- Green online status badge (bottom-right corner)
- 3px border in orange for consistency

**Edit Profile Button**
- Semi-transparent white background
- Pencil icon with text
- Tap to navigate to EditProfileScreen
- Auto-closes drawer after navigation

---

### 2. Navigation Items (Menu)

**User Menu Items**
```
📍 Home              (home-outline icon)
📦 My Orders         (cube-outline icon)
⭐ My Reviews        (star-outline icon)
✏️  Edit Profile     (pencil-outline icon)
```

**Admin Menu Items**
```
📊 Dashboard         (stats-chart-outline icon)
👥 Users             (people-outline icon)
📦 Products          (cube-outline icon)
📋 Orders            (receipt-outline icon)
🎁 Promos            (gift-outline icon)
💬 Reviews           (chatbubbles-outline icon)
🚗 Shipping          (car-outline icon)
📝 Activities        (list-outline icon)
```

**Active State**: Orange highlight (#FF8C42) on selected item

---

### 3. Footer Section

**Logout Button**
- Red/Pink background (#FFF5F5)
- Red text (#FF4444) with logout icon
- Confirmation alert before logout
- Auto-closes drawer after logout

**App Info**
- FitSphere name dark grey (#4B5563)
- Version number v1.0.0 light grey (#B0B0B0)

```
┌─────────────────────────────────────┐
│  🚪 Logout                          │  ← Light pink background
├─────────────────────────────────────┤
│    FitSphere                        │
│    v1.0.0                          │
└─────────────────────────────────────┘
```

---

## Architecture

### Navigation Hierarchy

**User Flow**
```
AppNavigator
  ├─ Auth Stack (Landing → Login → Register)
  └─ UserStack
      ├─ UserDrawer (with side menu)
      │   ├─ UserTabs (Bottom tabs: Home, Search, Cart, Orders, Profile)
      │   ├─ Orders (OrderHistoryScreen)
      │   ├─ Reviews (ReviewsScreen)
      │   └─ EditProfile (EditProfileScreen)
      └─ Modal Screens (on top, no drawer)
          ├─ ProductDetails
          ├─ Categories
          ├─ Checkout
          └─ NotificationDetails
```

**Admin Flow**
```
AppNavigator
  ├─ Auth Stack
  └─ AdminStack
      ├─ AdminDrawer (with side menu)
      │   ├─ AdminDashboard
      │   ├─ AdminUsers
      │   ├─ AdminProducts
      │   ├─ AdminOrders
      │   ├─ AdminPromoCodes
      │   ├─ AdminReviews
      │   ├─ AdminShipping
      │   └─ AdminReports
      └─ Modal Screens
          └─ AdminOrderDetails
```

---

## Implementation Details

### CustomDrawerContent Component

**Props**
```javascript
{
  navigation: DrawerNavigationProp,
  state: DrawerNavigationState,
  descriptors: DrawerDescriptors
}
```

**Redux Integration**
```javascript
const { user, isAuthenticated } = useSelector(state => state.auth);
const dispatch = useDispatch();
```

**Key Functions**
- `handleLogout()` - Alert confirmation + dispatch logout action
- Auto-navigation on item select with drawer close
- Avatar image fallback to placeholder

### Drawer Styling

**Width & Position**
- Drawer width: 75% of screen
- Positioned on left side
- Smooth slide animation
- Gesture detection enabled

**Color Scheme**
- Active item: Orange (#FF8C42)
- Inactive text: Dark grey (#4B5563)
- Background: White (#FFFFFF)
- Header: Orange (#FF8C42)

### Header Integration

**HeaderWithDrawer Component**
```javascript
import { HeaderWithDrawer } from '../components/HeaderWithDrawer';

screenOptions={({ navigation }) => ({
  ...HeaderWithDrawer(navigation, 'Screen Title', 'search', onSearchPress)
})}
```

**Features**
- Menu toggle button (hamburger icon)
- Screen title centered
- Optional right action button
- Orange styling (#FF8C42)
- Elevation shadow

---

## Usage Examples

### User Screen with Drawer

```javascript
// HomeScreen.js
import { HeaderWithDrawer } from '../components/HeaderWithDrawer';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Content */}
    </View>
  );
}

// In Navigator
<Drawer.Screen
  name="Home"
  component={UserTabs}
  options={({ navigation }) => ({
    headerShown: false, // UserTabs has its own header
    drawerIcon: ({ color, size }) => (
      <Ionicons name="home-outline" size={size} color={color} />
    ),
  })}
/>
```

### Opening Drawer Programmatically

```javascript
import { useNavigation } from '@react-navigation/native';

export default function MyScreen() {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <TouchableOpacity onPress={openDrawer}>
      <Text>Open Menu</Text>
    </TouchableOpacity>
  );
}
```

### Logout with Confirmation

```javascript
const handleLogout = () => {
  Alert.alert('Logout', 'Are you sure you want to logout?', [
    { text: 'Cancel', onPress: () => {} },
    {
      text: 'Logout',
      onPress: () => {
        dispatch(logout());
        props.navigation.closeDrawer();
      },
      style: 'destructive',
    },
  ]);
};
```

---

## Color Palette Reference

| Usage | Color | Hex | RGB |
|-------|-------|-----|-----|
| Primary (Logo, Active) | Orange | #FF8C42 | (255, 140, 66) |
| Secondary (Dark) | Dark Grey | #4B5563 | (75, 85, 99) |
| Success/Online | Green | #10b981 | (16, 185, 129) |
| Light Background | White | #FFFFFF | (255, 255, 255) |
| Light Grey Text | Light Grey | #B0B0B0 | (176, 176, 176) |
| Danger/Logout | Red | #FF4444 | (255, 68, 68) |
| Light Red BG | Light Red | #FFF5F5 | (255, 245, 245) |
| Transparent Light | 0.25 Alpha | rgba(255,255,255,0.25) | - |

---

## Animation & Transitions

### Drawer Animation
- Type: Slide (left to right)
- Duration: ~300ms (React Navigation default)
- Easing: Smooth

### Screen Transitions
- User screens: Bottom-to-top fade
- Admin screens: Left-to-right slide
- Modal screens: Modal presentation (bottom-up)

### Touch Interactions
- Drawer swipe from left edge
- Tap menu items to navigate
- Tap hamburger to toggle
- Haptic feedback (natural)

---

## Features & Interactions

### Profile Interactions
✅ View avatar image
✅ See user name & email
✅ View role badge (Admin/Customer)
✅ Online status indicator (green dot)
✅ Quick access Edit Profile button
✅ One-tap drawer close after navigation

### Menu Interactions
✅ Highlight current screen
✅ Icons + labels
✅ One-tap navigation
✅ Auto-drawer close
✅ Deep linking support

### Logout Safety
✅ Confirmation alert
✅ Clear messaging
✅ Cancel option
✅ Safe dismissal

---

## Customization

### Change Drawer Width
```javascript
drawerStyle: {
  width: '75%',  // Change this percentage
}
```

### Change Colors
```javascript
// Header color
headerStyle: { backgroundColor: '#YourColor' }

// Active/highlight color
drawerActiveTintColor: '#YourColor'

// Drawer background
drawerStyle: { backgroundColor: '#YourColor' }
```

### Add More Menu Items
```javascript
<Drawer.Screen
  name="YourScreen"
  component={YourComponent}
  options={{
    drawerLabel: 'Your Label',
    drawerIcon: ({ color, size }) => (
      <Ionicons name="icon-name" size={size} color={color} />
    ),
  }}
/>
```

---

## Responsive Design

- **Mobile**: Full drawer (75% width)
- **Tablet**: Drawer still 75% width (can be customized)
- **Landscape**: Same drawer width, content adapts
- **Safe Area**: Automatic padding on notched devices

---

## Performance Optimizations

✅ Lazy loading of screen components
✅ Redux selectors for avatar/profile data
✅ Memoized drawer content to prevent unnecessary re-renders
✅ Image caching for avatar
✅ Smooth 60fps animations

---

## Troubleshooting

### Drawer Not Opening
- Check navigation prop is passed correctly
- Verify Drawer.Navigator wraps screens
- Ensure menuItem press calls navigation.navigate()

### Header Not Showing
- Check `headerShown: true` on Stack.Screen
- Verify headerStyle is defined
- Ensure not inside modal presentation

### Avatar Not Loading
- Check image URL is valid
- Verify Redux user data is populated
- Check network connectivity

### Logout Not Working
- Verify logout() action exists in authSlice
- Check Redux dispatch is called
- Verify authentication check in AppNavigator

---

## File Structure

```
src/
├── navigation/
│   ├── AppNavigator.js (Updated with drawer)
│   └── CustomDrawer.js (NEW - drawer content)
├── components/
│   └── HeaderWithDrawer.js (NEW - header helper)
└── store/
    └── slices/
        └── authSlice.js (logout action)
```

---

## Summary

The drawer navigation provides:
- 🎨 Professional UI with custom header
- 🧭 Intuitive menu navigation
- 👤 User profile visibility
- 🔐 Safe logout with confirmation
- 🎯 Clear visual hierarchy
- ⚡ Smooth animations
- 📱 Mobile-optimized design
- 🎨 Consistent orange/grey theming

Ready to use in both user and admin flows!
