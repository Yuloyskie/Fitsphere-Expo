import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function SecurityScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Security</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          <Text style={styles.sectionText}>
            Your account security is our top priority. We use industry-standard encryption and security protocols to protect your personal information and transactions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Password Security</Text>
          <Text style={styles.sectionText}>
            - Use a strong, unique password with at least 8 characters
          </Text>
          <Text style={styles.sectionText}>
            - Include a mix of uppercase, lowercase, numbers, and special characters
          </Text>
          <Text style={styles.sectionText}>
            - Never share your password with anyone, including FitSphere staff
          </Text>
          <Text style={styles.sectionText}>
            - Change your password regularly, at least every 3 months
          </Text>
          <Text style={styles.sectionText}>
            - If you suspect unauthorized access, change your password immediately
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Two-Factor Authentication</Text>
          <Text style={styles.sectionText}>
            Coming Soon: Enable two-factor authentication for additional security on your account. This will require a second verification step when logging in.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Security</Text>
          <Text style={styles.sectionText}>
            - All payments are processed through secure, encrypted channels
          </Text>
          <Text style={styles.sectionText}>
            - Your credit card information is never stored on our servers
          </Text>
          <Text style={styles.sectionText}>
            - We comply with PCI DSS (Payment Card Industry Data Security Standard)
          </Text>
          <Text style={styles.sectionText}>
            - Review your transactions in your order history
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Protection</Text>
          <Text style={styles.sectionText}>
            We are committed to protecting your personal data in accordance with applicable data protection regulations. Your information is only used to improve your experience and is never sold to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suspicious Activity</Text>
          <Text style={styles.sectionText}>
            If you notice any suspicious activity on your account or have concerns about unauthorized access, please contact our security team immediately at security@fitsphere.com.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Management</Text>
          <Text style={styles.sectionText}>
            - Your session will automatically expire after 30 minutes of inactivity
          </Text>
          <Text style={styles.sectionText}>
            - Always log out when using shared devices
          </Text>
          <Text style={styles.sectionText}>
            - Clear your browser cache after logging out on public computers
          </Text>
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
});
