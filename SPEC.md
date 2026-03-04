# FitSphere E-Commerce Application Specification

## 1. Project Overview
- **Project Name**: FitSphere
- **Project Type**: E-commerce Mobile Application (React Native with ExpoGo)
- **Core Functionality**: A comprehensive e-commerce app for gym equipment with full user and admin functionalities
- **Technology**: React Native, Redux for state management, ExpoGo

## 2. Technology Stack & Choices
- **Framework**: React Native with ExpoGo
- **Language**: JavaScript/React
- **Navigation**: React Navigation (native-stack, bottom-tabs)
- **State Management**: Redux Toolkit
- **Data Storage**: AsyncStorage for local data persistence
- **UI Components**: React Native built-in components with custom styling

## 3. User Functionalities

### 3.1 User Registration and Login
- Users can register with email and password
- Users can log in to access their account
- Secure authentication flow

### 3.2 User Profile Management
- View and edit profile details (name, email, password)
- Upload and update profile picture

### 3.3 Product Browsing & Search
- Browse gym equipment by categories
- View detailed product pages with descriptions and images
- Search functionality for products

### 3.4 Shopping Cart
- Add items to cart
- View cart items
- Update quantities
- Remove items from cart

### 3.5 Checkout & Payment
- Proceed to checkout with selected items
- Multiple payment methods (credit card, PayPal, Apple Pay, Google Pay)
- Enter and save shipping details
- Apply promo codes and discounts

### 3.6 Order Management & Status
- View order history with details
- Track shipping progress
- Cancel or request returns for eligible orders

### 3.7 Reviews and Ratings
- Leave reviews and rate purchased equipment
- Report inappropriate reviews

## 4. Admin Functionalities

### 4.1 Admin Dashboard
- Overview of store performance
- Key metrics (total sales, orders, active users, stock levels)
- Quick access to pending orders and low-stock alerts

### 4.2 User Management (CRUD)
- Create new user accounts
- View and manage all user accounts
- Update or delete user accounts
- Reset user passwords

### 4.3 Product & Inventory Management
- Add, update, or remove gym equipment listings
- Manage stock levels and restocking alerts
- Categorize products by type, brand, and popularity

### 4.4 Order & Payment Management
- View, process, and update order statuses
- Issue refunds or handle return requests
- Configure payment gateways and manage transactions

### 4.5 Shipping & Delivery Management
- Set up shipping rates based on location or weight

### 4.6 Reports
- Receipt of transactions

## 5. UI/UX Design Direction
- **Visual Style**: Modern, clean, fitness/health-focused with Material Design 3 influences
- **Color Scheme**: 
  - Primary: #4CAF50 (Green - health/fitness theme)
  - Secondary: #FF9800 (Orange - energy)
  - Background: #FFFFFF (White)
  - Text: #212121 (Dark gray)
  - Accent: #2196F3 (Blue)
- **Layout**: Bottom tab navigation for users, Stack navigation for admins
- **Typography**: Clean sans-serif fonts with clear hierarchy
- **Icons**: Using @expo/vector-icons (Ionicons)

## 6. Screen Structure

### User Screens
1. **Splash Screen** - App loading
2. **Login Screen** - User authentication
3. **Register Screen** - New user registration
4. **Home Screen** - Featured products, categories, product listing
5. **Product Details Screen** - Product information, add to cart
6. **Search Screen** - Search products
7. **Categories Screen** - Browse by category
8. **Cart Screen** - Shopping cart management
9. **Checkout Screen** - Payment and shipping
10. **Order History Screen** - Past orders
11. **Order Details Screen** - Specific order details and tracking
12. **Profile Screen** - User profile management
13. **Edit Profile Screen** - Edit user details
14. **Reviews Screen** - Product reviews and ratings

### Admin Screens
1. **Admin Login Screen** - Admin authentication
2. **Admin Dashboard** - Overview and metrics
3. **Admin Users Screen** - User management
4. **Admin Products Screen** - Product management
5. **Admin Orders Screen** - Order management
6. **Admin Shipping Screen** - Shipping configuration
7. **Admin Reports Screen** - Transaction reports
