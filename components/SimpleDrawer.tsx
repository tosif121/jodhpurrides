import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Linking,
  Share,
  Alert,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createTheme } from '../themes';

interface SimpleDrawerProps {
  children: React.ReactNode;
}

const SimpleDrawer: React.FC<SimpleDrawerProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [slideAnim] = useState(
    new Animated.Value(-Dimensions.get('window').width * 0.85),
  );
  const [overlayOpacity] = useState(new Animated.Value(0));
  const { isDark, themeMode, setLightTheme, setDarkTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const theme = createTheme(isDark);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const shareApp = async () => {
    try {
      await Share.share({
        message:
          'Check out Jodhpur Bus Routes app! Find bus routes and schedules easily in Jodhpur. Download now!',
        title: 'Jodhpur Bus Routes App',
      });
    } catch (error) {
      console.error('Error sharing app:', error);
    }
  };
  const openAppStore = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/id123456789',
      android: 'https://play.google.com/store/apps/details?id=com.jodhpurrides',
    });

    if (storeUrl) {
      Linking.canOpenURL(storeUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(storeUrl);
          } else {
            Alert.alert(
              'Store Not Available',
              'Unable to open app store. Please search for "Jodhpur Bus Routes" in your app store.',
              [{ text: 'OK' }],
            );
          }
        })
        .catch(err => {
          console.error('Error opening app store:', err);
        });
    }
  };

  const openDrawer = () => {
    console.log('Opening drawer...');
    setIsDrawerOpen(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    console.log('Closing drawer...');
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -Dimensions.get('window').width * 0.85,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsDrawerOpen(false);
    });
  };

  const toggleDrawer = () => {
    console.log('Toggle drawer clicked, isDrawerOpen:', isDrawerOpen);
    if (isDrawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Menu Button */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.card,
            paddingTop: insets.top + 16,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.menuButton,
            isDrawerOpen && { backgroundColor: theme.colors.primary + '20' },
          ]}
          onPress={() => {
            console.log('Menu button pressed');
            toggleDrawer();
          }}
        >
          <Icon name="menu" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t('app_name')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <View
        style={[
          styles.content,
          {
            backgroundColor: theme.colors.background,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {children}
      </View>

      {/* Drawer Modal */}
      <Modal
        visible={isDrawerOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          {/* Overlay */}
          <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
            <TouchableOpacity
              style={styles.overlayTouchable}
              activeOpacity={1}
              onPress={closeDrawer}
            />
          </Animated.View>

          {/* Drawer Content */}
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                backgroundColor: theme.colors.background,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
              {/* Close Button */}
              <View style={styles.drawerTopBar}>
                <TouchableOpacity
                  style={[
                    styles.closeButton,
                    { backgroundColor: theme.colors.card },
                  ]}
                  onPress={closeDrawer}
                >
                  <Icon name="close" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {/* Drawer Header */}
              <View
                style={[
                  styles.drawerHeader,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Icon name="bus" size={28} color="#FFFFFF" />
                <Text style={styles.drawerHeaderTitle}>{t('app_name')}</Text>
              </View>

              {/* Scrollable Content */}
              <ScrollView
                style={styles.scrollContent}
                contentContainerStyle={[
                  styles.scrollContentContainer,
                  { paddingBottom: insets.bottom + 20 },
                ]}
                showsVerticalScrollIndicator={false}
              >
                {/* Navigation Items */}
                <View style={styles.navigationSection}>
                  <TouchableOpacity
                    style={[
                      styles.navItem,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={closeDrawer}
                  >
                    <Icon name="home" size={24} color={theme.colors.primary} />
                    <Text
                      style={[styles.navText, { color: theme.colors.text }]}
                    >
                      {t('home')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.navItem,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={closeDrawer}
                  >
                    <Icon name="map" size={24} color={theme.colors.primary} />
                    <Text
                      style={[styles.navText, { color: theme.colors.text }]}
                    >
                      {t('route_map')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Add Route Section */}
                <View
                  style={[
                    styles.addRouteSection,
                    { backgroundColor: theme.colors.primary + '15' },
                  ]}
                >
                  <Text
                    style={[
                      styles.addRouteTitle,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {t('add_route_help')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.addRouteButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => {
                      closeDrawer();
                      setTimeout(() => {
                        navigation.navigate('AddRoute' as never);
                      }, 300);
                    }}
                  >
                    <Icon name="add-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.addRouteButtonText}>
                      {t('add_route')}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Help & Support Section */}
                <View style={styles.helpSection}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                  >
                    {t('help_support')}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.navItem,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={() => {
                      closeDrawer();
                      setTimeout(() => {
                        openAppStore();
                      }, 300);
                    }}
                  >
                    <Icon name="star" size={24} color={theme.colors.primary} />
                    <Text
                      style={[styles.navText, { color: theme.colors.text }]}
                    >
                      {t('rate_review')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.navItem,
                      { backgroundColor: theme.colors.card },
                    ]}
                    onPress={() => {
                      closeDrawer();
                      setTimeout(() => {
                        shareApp();
                      }, 300);
                    }}
                  >
                    <Icon
                      name="share-social"
                      size={24}
                      color={theme.colors.primary}
                    />
                    <Text
                      style={[styles.navText, { color: theme.colors.text }]}
                    >
                      {t('share_app')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {/* Theme Section */}
                <View style={styles.themeSection}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                  >
                    {t('theme')}
                  </Text>

                  <View
                    style={[
                      styles.themeContainer,
                      { backgroundColor: theme.colors.card },
                    ]}
                  >
                    {/* Light Theme Button */}
                    <TouchableOpacity
                      style={[
                        styles.themeButton,
                        themeMode === 'light' && [
                          styles.activeThemeButton,
                          { backgroundColor: theme.colors.primary },
                        ],
                      ]}
                      onPress={() => {
                        setLightTheme();
                        setTimeout(closeDrawer, 500);
                      }}
                    >
                      <Icon
                        name="sunny"
                        size={20}
                        color={
                          themeMode === 'light' ? '#FFFFFF' : theme.colors.text
                        }
                      />
                      <Text
                        style={[
                          styles.themeButtonText,
                          {
                            color:
                              themeMode === 'light'
                                ? '#FFFFFF'
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {t('light')}
                      </Text>
                    </TouchableOpacity>

                    {/* Dark Theme Button */}
                    <TouchableOpacity
                      style={[
                        styles.themeButton,
                        themeMode === 'dark' && [
                          styles.activeThemeButton,
                          { backgroundColor: theme.colors.primary },
                        ],
                      ]}
                      onPress={() => {
                        setDarkTheme();
                        setTimeout(closeDrawer, 500);
                      }}
                    >
                      <Icon
                        name="moon"
                        size={20}
                        color={
                          themeMode === 'dark' ? '#FFFFFF' : theme.colors.text
                        }
                      />
                      <Text
                        style={[
                          styles.themeButtonText,
                          {
                            color:
                              themeMode === 'dark'
                                ? '#FFFFFF'
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {t('dark')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Language Section */}
                <View style={styles.themeSection}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.colors.text }]}
                  >
                    {t('language')}
                  </Text>

                  <View
                    style={[
                      styles.themeContainer,
                      { backgroundColor: theme.colors.card },
                    ]}
                  >
                    {/* English Language Button */}
                    <TouchableOpacity
                      style={[
                        styles.themeButton,
                        language === 'en' && [
                          styles.activeThemeButton,
                          { backgroundColor: theme.colors.primary },
                        ],
                      ]}
                      onPress={() => {
                        setLanguage('en');
                        setTimeout(closeDrawer, 500);
                      }}
                    >
                      <Icon
                        name="language"
                        size={20}
                        color={
                          language === 'en' ? '#FFFFFF' : theme.colors.text
                        }
                      />
                      <Text
                        style={[
                          styles.themeButtonText,
                          {
                            color:
                              language === 'en' ? '#FFFFFF' : theme.colors.text,
                          },
                        ]}
                      >
                        {t('english')}
                      </Text>
                    </TouchableOpacity>

                    {/* Hindi Language Button */}
                    <TouchableOpacity
                      style={[
                        styles.themeButton,
                        language === 'hi' && [
                          styles.activeThemeButton,
                          { backgroundColor: theme.colors.primary },
                        ],
                      ]}
                      onPress={() => {
                        setLanguage('hi');
                        setTimeout(closeDrawer, 500);
                      }}
                    >
                      <Icon
                        name="language"
                        size={20}
                        color={
                          language === 'hi' ? '#FFFFFF' : theme.colors.text
                        }
                      />
                      <Text
                        style={[
                          styles.themeButtonText,
                          {
                            color:
                              language === 'hi' ? '#FFFFFF' : theme.colors.text,
                          },
                        ]}
                      >
                        {t('hindi')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Footer */}
                <View
                  style={[
                    styles.footer,
                    {
                      borderTopColor: theme.colors.border,
                      paddingBottom: 16,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.footerText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {t('version')}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
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
    minHeight: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  menuButton: {
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
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: Dimensions.get('window').width * 0.85,
    maxWidth: 320,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  drawerContent: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  drawerTopBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 16,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  drawerHeader: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  drawerHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  navigationSection: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  addRouteSection: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(66, 153, 235, 0.2)',
  },
  addRouteTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 20,
  },
  addRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  addRouteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  helpSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  themeSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  themeContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeThemeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default SimpleDrawer;
