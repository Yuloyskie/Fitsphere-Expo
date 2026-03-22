# FitSphere - E-Commerce Mobile App

A React Native Expo mobile application for e-commerce with user and admin functionality.

## Features

- User authentication (login/register)
- Product browsing and categories
- Shopping cart
- Checkout process
- Order history and tracking
- User profile management
- Reviews and ratings
- Admin dashboard for managing users, products, orders, and reports

## Tech Stack

- React Native with Expo
- Redux for state management
- React Navigation for routing
- MongoDB Atlas + Mongoose (API backend)
- AsyncStorage for local session/cart cache

## Installation

1. Install dependencies:
   ```bash
   npm install
   npm run api:install
   ```

2. Start the MongoDB API server:
   ```bash
   npm run api:dev
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Run on Android:
   ```bash
   npx expo run:android
   ```

5. Run on iOS:
   ```bash
   npx expo run:ios
   ```

## Environment

- API server env: `server/.env`
- App env: `.env.local`

Required API variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```

Required app variable:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

For real phones, replace `localhost` with your computer LAN IP in `.env.local`.

## Project Structure

- `src/screens/` - Application screens
- `src/store/` - Redux store and slices
- `src/navigation/` - Navigation configuration
- `src/services/` - Services (notifications, etc.)
- `server/` - Express API + MongoDB models/endpoints

## License

MIT

