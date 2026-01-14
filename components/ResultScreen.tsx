import { useNavigation, NavigationProp } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createTheme } from '../themes';
import {
  busesApi,
  fareCalculator,
  FareCalculation,
} from '../lib/supabase';

// Import tab components
import InfoTab from './tabs/InfoTab';
import StopsTab from './tabs/StopsTab';
import TipsTab from './tabs/TipsTab';
import MapTab from './tabs/MapTab';

interface Bus {
  id: string;
  name: string;
  name_hi?: string;
}

interface BusRoute {
  buses?: Bus[];
  message?: string;
}

interface RouteDetails {
  id: string;
  name: string;
  name_hi?: string;
  description?: string;
  description_hi?: string;
  route_overview?: string;
  route_overview_hi?: string;
  highlights?: string[];
  highlights_hi?: string[];
  travel_tips?: string[];
  travel_tips_hi?: string[];
  bus_number?: string;
  fare_info?: {
    regular_fare?: string;
    student_fare?: string;
    senior_citizen_fare?: string;
    ac_bus_fare?: string;
  };
  bus_routes?: Array<{
    bus_stops?: {
      id: string;
      name: string;
      name_hi?: string;
      address?: string;
      address_hi?: string;
      latitude?: number;
      longitude?: number;
      description?: string;
      description_hi?: string;
      attractions?: string[];
      attractions_hi?: string[];
      facilities?: string[];
      facilities_hi?: string[];
      nearby_landmarks?: string[];
      nearby_landmarks_hi?: string[];
    };
    stop_order?: number;
    arrival_time?: string;
    departure_time?: string;
  }>;
}

type RootStackParamList = {
  Main: undefined;
};

interface RouteParams {
  busRoute: BusRoute;
  source: string;
  destination: string;
}

interface Route {
  params: RouteParams;
}

interface Props {
  route: Route;
}

const ResultScreen = ({ route }: Props) => {
  const { busRoute, source, destination } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  const theme = createTheme(isDark);
  const insets = useSafeAreaInsets();

  const [selectedBus, setSelectedBus] = useState<RouteDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [calculatedFare, setCalculatedFare] = useState<FareCalculation | null>(
    null,
  );
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [activeTab, setActiveTab] = useState<'info' | 'stops' | 'tips' | 'map'>(
    'stops',
  );

  // Helper function to translate bus names to Hindi
  const translateBusName = (name: string): string => {
    if (language === 'hi') {
      // Convert "Bus No. X" to "बस नंबर X"
      const busNoMatch = name.match(/Bus No\.\s*(\d+)/i);
      if (busNoMatch) {
        return `बस नंबर ${busNoMatch[1]}`;
      }
      
      // Convert "Bus X" to "बस X"
      const busMatch = name.match(/Bus\s*(\d+)/i);
      if (busMatch) {
        return `बस ${busMatch[1]}`;
      }
      
      // For other formats, just replace "Bus" with "बस"
      return name.replace(/Bus/gi, 'बस');
    }
    return name;
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const selectBus = async (bus: { id: string; name: string }) => {
    if (selectedBus?.id === bus.id) {
      setSelectedBus(null);
      setCalculatedFare(null);
      return;
    }

    setLoading(true);
    try {
      const details = await busesApi.getById(bus.id, language);
      setSelectedBus(details);

      const fare = fareCalculator.calculateFare(source, destination, details);
      setCalculatedFare(fare);
    } catch (error) {
      console.error('❌ Error loading bus details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Enhanced Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.colors.card, paddingTop: insets.top },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: theme.colors.background },
          ]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={22} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t('search_results')}
          </Text>
          <View style={styles.routeInfo}>
            <View
              style={[
                styles.routeBadge,
                { backgroundColor: theme.colors.primary + '15' },
              ]}
            >
              <Icon name="location" size={12} color={theme.colors.primary} />
              <Text
                style={[styles.routeText, { color: theme.colors.primary }]}
                numberOfLines={1}
              >
                {source}
              </Text>
            </View>
            <Icon
              name="arrow-forward"
              size={14}
              color={theme.colors.textSecondary}
            />
            <View
              style={[
                styles.routeBadge,
                { backgroundColor: theme.colors.success + '15' },
              ]}
            >
              <Icon name="flag" size={12} color={theme.colors.success} />
              <Text
                style={[styles.routeText, { color: theme.colors.success }]}
                numberOfLines={1}
              >
                {destination}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Results Summary */}
        {busRoute?.buses && busRoute.buses.length > 0 && (
          <Animated.View
            style={[
              styles.summaryCard,
              {
                backgroundColor: theme.colors.primary + '10',
                borderColor: theme.colors.primary + '30',
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.summaryContent}>
              <View
                style={[
                  styles.summaryIconContainer,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Icon name="checkmark-circle" size={20} color="#fff" />
              </View>
              <View style={styles.summaryText}>
                <Text
                  style={[styles.summaryTitle, { color: theme.colors.primary }]}
                >
                  {busRoute.buses.length}{' '}
                  {busRoute.buses.length === 1
                    ? t('bus_available')
                    : t('buses_available')}
                </Text>
                <Text
                  style={[
                    styles.summarySubtitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t('select_bus_to_view')}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Available Buses */}
        {busRoute?.buses && busRoute.buses.length > 0 ? (
          <View style={styles.section}>
            {busRoute.buses.map((bus, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 30 + index * 10],
                      }),
                    },
                  ],
                }}
              >
                <View
                  style={[
                    styles.busCard,
                    {
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                    },
                    selectedBus?.id === bus.id && {
                      borderColor: theme.colors.primary,
                      borderWidth: 2,
                      elevation: 6,
                      shadowOpacity: 0.2,
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.busCardHeader}
                    onPress={() => selectBus(bus)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.busIcon,
                        { backgroundColor: theme.colors.primary + '20' },
                      ]}
                    >
                      <Icon name="bus" size={26} color={theme.colors.primary} />
                    </View>
                    <View style={styles.busInfo}>
                      <View style={styles.busNameRow}>
                        <Text
                          style={[styles.busName, { color: theme.colors.text }]}
                        >
                          {translateBusName(bus.name)}
                        </Text>
                        <Icon
                          name={
                            selectedBus?.id === bus.id
                              ? 'chevron-up-circle'
                              : 'chevron-down-circle'
                          }
                          size={24}
                          color={
                            selectedBus?.id === bus.id
                              ? theme.colors.primary
                              : theme.colors.textSecondary
                          }
                        />
                      </View>
                      <View style={styles.busMetaRow}>
                        <View style={styles.busMetaItem}>
                          <Icon
                            name="time-outline"
                            size={12}
                            color={theme.colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.busSubtext,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {t('continuous')}
                          </Text>
                        </View>
                        <View style={styles.busMetaDivider} />
                        <View style={styles.busMetaItem}>
                          <Icon
                            name="calendar-outline"
                            size={12}
                            color={theme.colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.busSubtext,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            6 AM - 9 PM
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* Expanded Bus Details */}
                  {selectedBus?.id === bus.id && (
                    <View
                      style={[
                        styles.busDetails,
                        { borderTopColor: theme.colors.border },
                      ]}
                    >
                      {loading ? (
                        <View style={styles.loadingContainer}>
                          <ActivityIndicator
                            size="large"
                            color={theme.colors.primary}
                          />
                          <Text
                            style={[
                              styles.loadingText,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {t('loading')}...
                          </Text>
                        </View>
                      ) : (
                        <>
                          {/* Enhanced Single Fare Display with Time */}
                          {(calculatedFare || selectedBus.fare_info) && (
                            <View
                              style={[
                                styles.singleFareCard,
                                {
                                  backgroundColor: theme.colors.success + '10',
                                  borderColor: theme.colors.success + '30',
                                },
                              ]}
                            >
                              <View style={styles.singleFareRow}>
                                <View style={styles.fareInfoSection}>
                                  <Text
                                    style={[
                                      styles.singleFareLabel,
                                      { color: theme.colors.textSecondary },
                                    ]}
                                  >
                                    {t('estimated_fare')}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.singleFareValue,
                                      { color: theme.colors.success },
                                    ]}
                                  >
                                    {calculatedFare
                                      ? fareCalculator.formatFare(
                                          calculatedFare.fare_amount,
                                        )
                                      : selectedBus.fare_info?.regular_fare ||
                                        '₹10'}
                                  </Text>
                                  {calculatedFare &&
                                    calculatedFare.distance_km > 0 && (
                                      <Text
                                        style={[
                                          styles.singleFareDistance,
                                          { color: theme.colors.textSecondary },
                                        ]}
                                      >
                                        {fareCalculator.formatDistance(
                                          calculatedFare.distance_km,
                                        )}{' '}
                                        • {calculatedFare.distance_stops}{' '}
                                        {t('stops')}
                                      </Text>
                                    )}
                                </View>
                                
                                <View style={styles.timeInfoSection}>
                                  <Text
                                    style={[
                                      styles.timeLabel,
                                      { color: theme.colors.textSecondary },
                                    ]}
                                  >
                                    {t('estimated_time')}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.timeValue,
                                      { color: theme.colors.primary },
                                    ]}
                                  >
                                    {calculatedFare && calculatedFare.distance_km > 0 
                                      ? `~${Math.ceil(calculatedFare.distance_km * 3)} min`
                                      : '15-20 min'
                                    }
                                  </Text>
                                </View>

                                <View
                                  style={[
                                    styles.singleFareIcon,
                                    { backgroundColor: theme.colors.success },
                                  ]}
                                >
                                  <Icon name="cash" size={16} color="#fff" />
                                </View>
                              </View>
                            </View>
                          )}

                          {/* Content Tabs */}
                          <View style={styles.tabsContainer}>
                            <View
                              style={[
                                styles.tabBar,
                                { backgroundColor: theme.colors.background },
                              ]}
                            >
                              <TouchableOpacity
                                style={[
                                  styles.tabButton,
                                  activeTab === 'info' && {
                                    backgroundColor: theme.colors.primary,
                                  },
                                ]}
                                onPress={() => setActiveTab('info')}
                              >
                                <Icon
                                  name="information-circle"
                                  size={22}
                                  color={
                                    activeTab === 'info'
                                      ? '#fff'
                                      : theme.colors.textSecondary
                                  }
                                />
                                <Text
                                  style={[
                                    styles.tabButtonText,
                                    {
                                      color:
                                        activeTab === 'info'
                                          ? '#fff'
                                          : theme.colors.textSecondary,
                                    },
                                  ]}
                                  numberOfLines={1}
                                  adjustsFontSizeToFit
                                >
                                  {t('tab_info')}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.tabButton,
                                  activeTab === 'stops' && {
                                    backgroundColor: theme.colors.primary,
                                  },
                                ]}
                                onPress={() => setActiveTab('stops')}
                              >
                                <Icon
                                  name="trail-sign"
                                  size={22}
                                  color={
                                    activeTab === 'stops'
                                      ? '#fff'
                                      : theme.colors.textSecondary
                                  }
                                />
                                <Text
                                  style={[
                                    styles.tabButtonText,
                                    {
                                      color:
                                        activeTab === 'stops'
                                          ? '#fff'
                                          : theme.colors.textSecondary,
                                    },
                                  ]}
                                  numberOfLines={1}
                                  adjustsFontSizeToFit
                                >
                                  {t('tab_stops')}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.tabButton,
                                  activeTab === 'tips' && {
                                    backgroundColor: theme.colors.primary,
                                  },
                                ]}
                                onPress={() => setActiveTab('tips')}
                              >
                                <Icon
                                  name="bulb"
                                  size={22}
                                  color={
                                    activeTab === 'tips'
                                      ? '#fff'
                                      : theme.colors.textSecondary
                                  }
                                />
                                <Text
                                  style={[
                                    styles.tabButtonText,
                                    {
                                      color:
                                        activeTab === 'tips'
                                          ? '#fff'
                                          : theme.colors.textSecondary,
                                    },
                                  ]}
                                  numberOfLines={1}
                                  adjustsFontSizeToFit
                                >
                                  {t('tab_tips')}
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[
                                  styles.tabButton,
                                  activeTab === 'map' && {
                                    backgroundColor: theme.colors.primary,
                                  },
                                ]}
                                onPress={() => setActiveTab('map')}
                              >
                                <Icon
                                  name="map"
                                  size={22}
                                  color={
                                    activeTab === 'map'
                                      ? '#fff'
                                      : theme.colors.textSecondary
                                  }
                                />
                                <Text
                                  style={[
                                    styles.tabButtonText,
                                    {
                                      color:
                                        activeTab === 'map'
                                          ? '#fff'
                                          : theme.colors.textSecondary,
                                    },
                                  ]}
                                  numberOfLines={1}
                                  adjustsFontSizeToFit
                                >
                                  {t('tab_map')}
                                </Text>
                              </TouchableOpacity>
                            </View>

                            {/* Tab Content */}
                            <View
                              style={[
                                styles.tabContent,
                                { backgroundColor: theme.colors.background },
                              ]}
                            >
                              {/* Info Tab */}
                              {activeTab === 'info' && (
                                <InfoTab 
                                  selectedBus={selectedBus} 
                                  source={source}
                                  destination={destination}
                                  calculatedFare={calculatedFare}
                                />
                              )}

                              {/* Stops Tab */}
                              {activeTab === 'stops' && (
                                <StopsTab 
                                  selectedBus={selectedBus} 
                                  source={source} 
                                  destination={destination} 
                                />
                              )}

                              {/* Tips Tab */}
                              {activeTab === 'tips' && (
                                <TipsTab 
                                  selectedBus={selectedBus}
                                  source={source}
                                  destination={destination}
                                  calculatedFare={calculatedFare}
                                />
                              )}

                              {/* Map Tab */}
                              {activeTab === 'map' && (
                                <MapTab 
                                  selectedBus={selectedBus} 
                                  source={source} 
                                  destination={destination}
                                />
                              )}
                            </View>
                          </View>
                        </>
                      )}
                    </View>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
        ) : (
          <Animated.View
            style={[
              styles.noResultsCard,
              {
                backgroundColor: theme.colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View
              style={[
                styles.noResultsIcon,
                { backgroundColor: theme.colors.textSecondary + '15' },
              ]}
            >
              <Icon
                name="search"
                size={48}
                color={theme.colors.textSecondary}
              />
            </View>
            <Text style={[styles.noResultsTitle, { color: theme.colors.text }]}>
              {t('no_buses_found')}
            </Text>
            <Text
              style={[
                styles.noResultsSubtext,
                { color: theme.colors.textSecondary },
              ]}
            >
              {t('try_different_route')}
            </Text>
            <TouchableOpacity
              style={[
                styles.retryButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Icon name="refresh" size={18} color="#fff" />
              <Text style={styles.retryButtonText}>{t('try_again')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 6,
    maxWidth: width * 0.3,
  },
  routeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  busCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: 'hidden',
  },
  busCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  busIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  busInfo: {
    flex: 1,
  },
  busNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  busName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    flex: 1,
  },
  busMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  busMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  busMetaDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#ddd',
  },
  busSubtext: {
    fontSize: 13,
    fontWeight: '600',
  },
  busDetails: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1.5,
    flex: 1, // Take up remaining space in the card
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
    gap: 18,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  singleFareCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
  },
  singleFareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  fareInfoSection: {
    flex: 1,
  },
  singleFareLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 1,
  },
  singleFareValue: {
    fontSize: 20,
    fontWeight: '900',
  },
  singleFareDistance: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  timeInfoSection: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 1,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  singleFareIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    marginTop: 8,
    flex: 1, // Take up remaining space
    minHeight: Dimensions.get('window').height * 0.35, // Minimum 35% of screen
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
    gap: 4,
    minHeight: 60,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  tabContent: {
    borderRadius: 12,
    padding: 12,
    flex: 1, // Take up remaining space
    minHeight: Dimensions.get('window').height * 0.4, // Minimum 40% of screen
  },
  noResultsCard: {
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  noResultsIcon: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  noResultsTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  noResultsSubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
export default ResultScreen;
