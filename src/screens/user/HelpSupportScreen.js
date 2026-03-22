import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HelpSupportScreen() {
  const [expandedId, setExpandedId] = useState(null);

  const faqs = [
    {
      id: 1,
      question: 'What are the shipping options?',
      answer: 'We offer standard and express shipping options. Standard shipping typically takes 5-7 business days, while express shipping takes 2-3 business days. Shipping costs vary based on your location and order size.',
    },
    {
      id: 2,
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy on most items. Items must be unused and in original packaging. To initiate a return, visit your order history and select the return option. Refunds are processed within 5-10 business days after we receive your return.',
    },
    {
      id: 3,
      question: 'How do I track my order?',
      answer: 'You can track your order in the "My Orders" section of your profile. Once your order is shipped, you will receive a tracking number via email. You can use this number to track your shipment in real-time.',
    },
    {
      id: 4,
      question: 'Do you offer warranties on equipment?',
      answer: 'Most of our equipment comes with a manufacturer warranty. Warranty details are provided in the product description. Extended warranties are also available for purchase on select items.',
    },
    {
      id: 5,
      question: 'How can I contact customer support?',
      answer: 'You can reach our customer support team at support@fitsphere.com or call our hotline during business hours. We typically respond to emails within 24 hours.',
    },
    {
      id: 6,
      question: 'Do you offer bulk discounts?',
      answer: 'Yes, we offer bulk discounts for orders of 10 or more items. Please contact our sales team at bulk@fitsphere.com for a customized quote.',
    },
    {
      id: 7,
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 1 hour of placement. After that, please contact our customer support team to assist you. If your order has already shipped, you will need to use our return process.',
    },
    {
      id: 8,
      question: 'Is my payment information secure?',
      answer: 'Yes, we use industry-standard encryption and secure payment gateways to protect your information. Your payment details are never stored on our servers.',
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Help & Support</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.id)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#FF8C42"
                />
              </View>
              {expandedId === faq.id && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.contactText}>Email: support@fitsphere.com</Text>
          <Text style={styles.contactText}>Phone: 1-800-FIT-SPHERE</Text>
          <Text style={styles.contactText}>Hours: Monday - Friday, 9:00 AM - 6:00 PM EST</Text>
          <Text style={styles.contactText}>Weekend Support: Saturday - Sunday, 10:00 AM - 4:00 PM EST</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Resources</Text>
          <Text style={styles.resourceText}>- Product Guides: Learn how to use and maintain your equipment</Text>
          <Text style={styles.resourceText}>- Blog: Tips, workout routines, and fitness advice</Text>
          <Text style={styles.resourceText}>- Community: Connect with other fitness enthusiasts</Text>
          <Text style={styles.resourceText}>- Video Tutorials: Step-by-step setup and usage guides</Text>
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
    marginBottom: 15,
    color: '#FF8C42',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 13,
    color: '#666666',
    marginTop: 10,
    lineHeight: 20,
  },
  contactText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 20,
  },
  resourceText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 20,
  },
});
