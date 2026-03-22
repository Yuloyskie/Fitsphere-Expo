import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import { setShowLanding } from '../../store/slices/authSlice';

const { width, height } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  const dispatch = useDispatch();

  const handleGetStarted = () => {
    dispatch(setShowLanding(false));
    navigation.navigate('Login');
  };

  return (
    <ImageBackground
      source={require('../../../images/BackgroundGym.webp')}
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          
          <Image
            source={require('../../../images/Logo_of_fitsphere-removebg-preview.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  imageStyle: {
    opacity: 0.7,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 30,
    letterSpacing: 1,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 50,
  },
  getStartedButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
