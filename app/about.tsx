import React from 'react';
import { Colors } from '../Constants/Colors'; 
import { useThemeStore } from "../store/useThemeStore";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n/i18n';
 
function AboutScreen() {
  const isRTL = i18n.language === 'ar';
  const { t } = useTranslation();
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const mainColor = useThemeStore((state) => state.mainColor);
  return (
    <ScrollView style={styles.container}>
      {/* Logo/Icon */}
      <View style={[styles.header, { backgroundColor: theme.card, }]}>
        <View style={styles.iconContainer}>
          <Ionicons name="book-outline" size={40} color={mainColor} />
        </View>
        <Text style={[styles.appName, { color: theme.primary }]}>{t('appName')} </Text>
        <Text style={[styles.version, { color: theme.primary }]}>{t('version')}</Text>
      </View>

      {/* الوصف */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.secondary, textAlign: isRTL ? 'right' : 'left' }]}>{t('descriptionTitle')}</Text>
        <Text style={[styles.description, { color: theme.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('description')}
        </Text>
      </View>

      {/* المميزات */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.secondary, textAlign: isRTL ? 'right' : 'left' }]}>{t('featuresTitle')}</Text>
        
        <View style={[styles.feature, { backgroundColor: theme.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="create-outline" size={24} color="#4CAF50" />
          <Text style={[styles.featureText, { color: theme.primary }]}>{t('feature1Edit')}</Text>
        </View>
        
        <View style={[styles.feature, { backgroundColor: theme.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="search-outline" size={24} color="#2196F3" />
          <Text style={[styles.featureText, { color: theme.primary }]}>{t('feature2Search')}</Text>
        </View>
        
        <View style={[styles.feature, { backgroundColor: theme.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
          <Text style={[styles.featureText, { color: theme.primary }]}>{t('feature3Trash')}</Text>
        </View>
        
        <View style={[styles.feature, { backgroundColor: theme.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="moon-outline" size={24} color="#FF9800" />
          <Text style={[styles.featureText, { color: theme.primary }]}>{t('feature4DarkMode')}</Text>
        </View>
        
        <View style={[styles.feature, { backgroundColor: theme.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="language-outline" size={24} color="#9C27B0" />
          <Text style={[styles.featureText, { color: theme.primary }]}>{t('feature5Language')}</Text>
        </View>

        <View style={[styles.feature, { backgroundColor: theme.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>{/* اضافة الميزة هنا */}
          <Ionicons name="color-palette" size={24} color="#FFC107" />
          <Text style={[styles.featureText, { color: theme.primary }]}>{t('feature6Theme')} </Text>
        </View>

        <View style={[styles.feature, { backgroundColor: theme.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>{/* اضافة الميزة هنا */}
          <Ionicons name="ellipsis-horizontal" size={24} color="#8BC34A" />
          <Text style={[styles.featureText, { color: theme.primary }]}>{t('feature7More')}</Text>
        </View>


      </View>

      {/* المطور */}
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.secondary, textAlign: isRTL ? 'right' : 'left' }]}>{t('developerTitle')}</Text>
        <Text style={[styles.description, { color: theme.primary, textAlign: isRTL ? 'right' : 'left' }]}>
          {t('developer')}
        </Text>
        
        {/* روابط التواصل - اختياري */}
        <TouchableOpacity 
          style={[styles.linkButton, { flexDirection: isRTL ? 'row' : 'row-reverse' }]}
          onPress={() => Linking.openURL('mailto:abdulrahman.dev25@gmail.com')}
        >
          <Ionicons name="mail-outline" size={20} color="#007AFF" />
          <Text style={styles.linkText}>{t('email')}</Text>
        </TouchableOpacity>
      </View>

      {/* الإصدار والحقوق */}
      <View style={[styles.footer, { backgroundColor: theme.background }]}>
        <Text style={[styles.footerText, { color: theme.primary }]}>
          {t('Copyright')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
    textAlign: 'right',
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 24,
    textAlign: 'right',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  linkText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#999',
  },
  divider:{
    width: "100%",
    height: 2,
    backgroundColor: "#E3F2FD",
  },
  backButton:{
    flexDirection: 'row-reverse',
    position: 'absolute',
    gap: 10,
    right: 20,
    top: 40,
  },
  backButtonText:{
    fontSize: 16,
    fontWeight: '600',
  }
});

export default AboutScreen;