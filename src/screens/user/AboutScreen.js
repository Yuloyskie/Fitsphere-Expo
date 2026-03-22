import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>About FitSphere</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            FitSphere is dedicated to making fitness accessible to everyone. Our mission is to provide high-quality fitness equipment and accessories that empower individuals to achieve their health and wellness goals. We believe that fitness is not a destination, but a journey, and we're here to support you every step of the way.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Purpose</Text>
          <Text style={styles.sectionText}>
            We exist to bridge the gap between fitness aspirations and reality by offering premium equipment at competitive prices. FitSphere combines quality, affordability, and convenience to create a comprehensive fitness marketplace. Whether you're a beginner starting your fitness journey or a seasoned athlete looking to upgrade your home gym, FitSphere has something for everyone.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose FitSphere</Text>
          <Text style={styles.sectionText}>
            - Wide variety of fitness equipment and accessories
          </Text>
          <Text style={styles.sectionText}>
            - Competitive pricing and regular promotions
          </Text>
          <Text style={styles.sectionText}>
            - Fast and reliable delivery
          </Text>
          <Text style={styles.sectionText}>
            - Expert product reviews and ratings from our community
          </Text>
          <Text style={styles.sectionText}>
            - Dedicated customer support
          </Text>
          <Text style={styles.sectionText}>
            - Secure and easy checkout process
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Vision</Text>
          <Text style={styles.sectionText}>
            To become the leading online fitness marketplace trusted by millions worldwide. We envision a world where everyone has access to the tools and knowledge they need to lead healthier, more active lives.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
          <Text style={styles.footerText}>Copyright 2024 FitSphere. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#FF8C42',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333333',
    marginBottom: 8,
  },
  footer: {
    marginTop: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 5,
  },
});
