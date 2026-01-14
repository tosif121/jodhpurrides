import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTheme } from '../../themes';
import { FareCalculation } from '../../lib/supabase';

interface BusStop {
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
}

interface RouteStop {
  bus_stops?: BusStop;
  stop_order?: number;
  arrival_time?: string;
  departure_time?: string;
}

interface RouteDetails {
  name?: string;
  name_hi?: string;
  bus_routes?: RouteStop[];
}

interface InfoTabProps {
  selectedBus: RouteDetails;
  source: string;
  destination: string;
  calculatedFare: FareCalculation | null;
}

const InfoTab: React.FC<InfoTabProps> = ({ selectedBus, source, destination, calculatedFare }) => {
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  const theme = createTheme(isDark);

  // Get journey-specific information
  const getJourneyInfo = () => {
    if (!selectedBus.bus_routes) return null;

    const sourceStop = selectedBus.bus_routes.find(
      route => route.bus_stops?.name === source
    )?.bus_stops;
    
    const destStop = selectedBus.bus_routes.find(
      route => route.bus_stops?.name === destination
    )?.bus_stops;

    // Get stops between source and destination
    const sourceIndex = selectedBus.bus_routes.findIndex(
      stop => stop.bus_stops?.name === source
    );
    const destIndex = selectedBus.bus_routes.findIndex(
      stop => stop.bus_stops?.name === destination
    );

    if (sourceIndex === -1 || destIndex === -1) return null;

    const minIndex = Math.min(sourceIndex, destIndex);
    const maxIndex = Math.max(sourceIndex, destIndex);
    const journeyStops = selectedBus.bus_routes.slice(minIndex, maxIndex + 1);

    return {
      sourceStop,
      destStop,
      journeyStops,
      totalStops: journeyStops.length,
      intermediateStops: journeyStops.length - 2, // Excluding source and destination
    };
  };

  const journeyInfo = getJourneyInfo();

  // Get unique attractions and facilities along the route
  const getRouteHighlights = () => {
    if (!journeyInfo) return { attractions: [], facilities: [], landmarks: [] };

    const attractions = new Set<string>();
    const facilities = new Set<string>();
    const landmarks = new Set<string>();

    journeyInfo.journeyStops.forEach(stop => {
      const stopAttractions = language === 'hi' 
        ? stop.bus_stops?.attractions_hi || stop.bus_stops?.attractions || []
        : stop.bus_stops?.attractions || [];
      
      const stopFacilities = language === 'hi'
        ? stop.bus_stops?.facilities_hi || stop.bus_stops?.facilities || []
        : stop.bus_stops?.facilities || [];
      
      const stopLandmarks = language === 'hi'
        ? stop.bus_stops?.nearby_landmarks_hi || stop.bus_stops?.nearby_landmarks || []
        : stop.bus_stops?.nearby_landmarks || [];

      stopAttractions.forEach(attr => attractions.add(attr));
      stopFacilities.forEach(fac => facilities.add(fac));
      stopLandmarks.forEach(land => landmarks.add(land));
    });

    return {
      attractions: Array.from(attractions),
      facilities: Array.from(facilities),
      landmarks: Array.from(landmarks),
    };
  };

  const routeHighlights = getRouteHighlights();

  if (!journeyInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Icon name="information-circle-outline" size={40} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('no_journey_info')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Route Attractions */}
        {routeHighlights.attractions.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              {t('attractions_along_route')}
            </Text>
            {routeHighlights.attractions.slice(0, 5).map((attraction, idx) => (
              <View key={idx} style={styles.highlightItem}>
                <Icon name="camera" size={16} color={theme.colors.success} />
                <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                  {attraction}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Route Facilities */}
        {routeHighlights.facilities.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              {t('facilities_available')}
            </Text>
            {routeHighlights.facilities.slice(0, 5).map((facility, idx) => (
              <View key={idx} style={styles.highlightItem}>
                <Icon name="checkmark-circle" size={16} color={theme.colors.primary} />
                <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                  {facility}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Nearby Landmarks */}
        {routeHighlights.landmarks.length > 0 && (
          <View style={styles.infoSection}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              {t('nearby_landmarks')}
            </Text>
            {routeHighlights.landmarks.slice(0, 5).map((landmark, idx) => (
              <View key={idx} style={styles.highlightItem}>
                <Icon name="business" size={16} color={theme.colors.warning} />
                <Text style={[styles.highlightText, { color: theme.colors.textSecondary }]}>
                  {landmark}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Source & Destination Details */}
        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
            {t('stop_details')}
          </Text>
          
          {/* Source Stop */}
          <View style={[styles.stopDetailCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.stopDetailHeader}>
              <Icon name="location" size={18} color={theme.colors.primary} />
              <Text style={[styles.stopDetailTitle, { color: theme.colors.text }]}>
                {source}
              </Text>
            </View>
            {journeyInfo.sourceStop?.address && (
              <Text style={[styles.stopDetailAddress, { color: theme.colors.textSecondary }]}>
                {language === 'hi' 
                  ? journeyInfo.sourceStop.address_hi || journeyInfo.sourceStop.address
                  : journeyInfo.sourceStop.address}
              </Text>
            )}
          </View>

          {/* Destination Stop */}
          <View style={[styles.stopDetailCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.stopDetailHeader}>
              <Icon name="flag" size={18} color={theme.colors.success} />
              <Text style={[styles.stopDetailTitle, { color: theme.colors.text }]}>
                {destination}
              </Text>
            </View>
            {journeyInfo.destStop?.address && (
              <Text style={[styles.stopDetailAddress, { color: theme.colors.textSecondary }]}>
                {language === 'hi' 
                  ? journeyInfo.destStop.address_hi || journeyInfo.destStop.address
                  : journeyInfo.destStop.address}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    flex: 1,
  },
  stopDetailCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  stopDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stopDetailTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopDetailAddress: {
    fontSize: 12,
    marginLeft: 26,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default InfoTab;