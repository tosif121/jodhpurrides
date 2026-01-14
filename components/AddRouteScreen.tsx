import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createTheme } from '../themes';

interface Props {
  navigation: {
    goBack: () => void;
  };
}

const AddRouteScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const theme = createTheme(isDark);
  const insets = useSafeAreaInsets();
  
  const [routeName, setRouteName] = useState('');
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [stops, setStops] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  const handleSubmit = () => {
    if (!routeName || !startPoint || !endPoint) {
      Alert.alert(t('missing_info'), t('fill_required_fields'));
      return;
    }

    // TODO: Submit to backend/database
    Alert.alert(
      t('thank_you'),
      t('route_submitted'),
      [
        {
          text: t('ok'),
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: theme.colors.card,
          paddingTop: insets.top + 12,
        }
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('add_route')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Message */}
        <View style={[styles.welcomeCard, { backgroundColor: theme.colors.primary + '15' }]}>
          <Icon name="heart" size={24} color={theme.colors.primary} />
          <Text style={[styles.welcomeText, { color: theme.colors.primary }]}>
            {t('add_route_help')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('route_name')} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder={t('route_name_placeholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={routeName}
              onChangeText={setRouteName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('start_point')} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder={t('start_point_placeholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={startPoint}
              onChangeText={setStartPoint}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('end_point')} *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder={t('end_point_placeholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={endPoint}
              onChangeText={setEndPoint}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('major_stops')}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder={t('major_stops_placeholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={stops}
              onChangeText={setStops}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('your_contact')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder={t('contact_placeholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={contactInfo}
              onChangeText={setContactInfo}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t('additional_info')}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.multilineInput,
                {
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              placeholder={t('additional_info_placeholder')}
              placeholderTextColor={theme.colors.textTertiary}
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit}
        >
          <Icon name="send" size={20} color="#FFFFFF" />
          <Text style={styles.submitButtonText}>{t('submit_route')}</Text>
        </TouchableOpacity>

        {/* Footer Note */}
        <Text style={[styles.footerNote, { color: theme.colors.textSecondary }]}>
          * {t('required_fields')}{'\n'}
          {t('add_route_help')}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  welcomeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 12,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 32,
  },
});

export default AddRouteScreen;