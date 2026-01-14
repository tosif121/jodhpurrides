import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Linking, Alert, PermissionsAndroid, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTheme } from '../../themes';
import { googleMapsUtils } from '../../lib/supabase';

interface BusStop {
  id: string;
  name: string;
  name_hi?: string;
  address?: string;
  address_hi?: string;
  latitude?: number;
  longitude?: number;
}

interface RouteStop {
  bus_stops?: BusStop;
  stop_order?: number;
  arrival_time?: string;
  departure_time?: string;
}

interface RouteDetails {
  id?: string;
  name?: string;
  bus_routes?: RouteStop[];
}

interface MapTabProps {
  selectedBus: RouteDetails;
  source: string;
  destination: string;
}
const MapTab: React.FC<MapTabProps> = ({ selectedBus, source, destination }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const theme = createTheme(isDark);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to location to show your position on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // iOS permissions are handled automatically by react-native-maps
        setHasLocationPermission(true);
      }
    } catch (err) {
      console.warn('Location permission error:', err);
      setHasLocationPermission(false);
    }
  };

  // Validate coordinates and filter valid stops
  const getValidStops = () => {
    if (!selectedBus?.bus_routes) return [];
    
    return selectedBus.bus_routes.filter(routeStop => {
      if (!routeStop.bus_stops?.latitude || !routeStop.bus_stops?.longitude) {
        return false;
      }
      
      const lat = Number(routeStop.bus_stops.latitude);
      const lng = Number(routeStop.bus_stops.longitude);
      
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    });
  };

  // Calculate map region based on actual route coordinates
  const calculateMapRegion = (journeyStops: any[]) => {
    if (journeyStops.length === 0) {
      // Fallback to Jodhpur center if no valid coordinates
      return {
        latitude: 26.2389,
        longitude: 73.0243,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    // Calculate bounds of the journey route
    const latitudes = journeyStops.map(stop => Number(stop.bus_stops!.latitude!));
    const longitudes = journeyStops.map(stop => Number(stop.bus_stops!.longitude!));

    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);

    // Calculate center point
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    // Calculate deltas with padding (40% extra space around the route)
    const latDelta = Math.max((maxLat - minLat) * 1.4, 0.01); // Minimum delta for single point
    const lngDelta = Math.max((maxLng - minLng) * 1.4, 0.01);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  // Get filtered stops for the selected journey segment only
  const getJourneyStops = () => {
    const validStops = getValidStops();
    
    if (validStops.length === 0) return [];

    // Find source and destination indices
    const sourceIndex = selectedBus.bus_routes?.findIndex(
      stop => stop.bus_stops?.name === source,
    ) || 0;
    const destIndex = selectedBus.bus_routes?.findIndex(
      stop => stop.bus_stops?.name === destination,
    ) || 0;

    const minIndex = Math.min(sourceIndex, destIndex);
    const maxIndex = Math.max(sourceIndex, destIndex);

    // Filter to only include stops in the journey segment
    return validStops.filter((routeStop) => {
      const actualIndex = selectedBus.bus_routes?.findIndex(
        stop => stop.bus_stops?.id === routeStop.bus_stops!.id,
      ) || 0;
      return actualIndex >= minIndex && actualIndex <= maxIndex;
    });
  };

  const validStops = getValidStops();
  const journeyStops = getJourneyStops();
  const hasValidCoordinates = journeyStops.length > 0;
  const mapRegion = calculateMapRegion(journeyStops);

  const openGoogleMaps = async () => {
    try {
      let googleMapsUrl = '';

      if (selectedBus) {
        const sourceRoute = selectedBus.bus_routes?.find(
          route => route.bus_stops?.name === source,
        );
        const destRoute = selectedBus.bus_routes?.find(
          route => route.bus_stops?.name === destination,
        );

        const sourceCoords =
          sourceRoute?.bus_stops?.latitude && sourceRoute?.bus_stops?.longitude
            ? {
                lat: sourceRoute.bus_stops.latitude,
                lng: sourceRoute.bus_stops.longitude,
              }
            : undefined;
        const destCoords =
          destRoute?.bus_stops?.latitude && destRoute?.bus_stops?.longitude
            ? {
                lat: destRoute.bus_stops.latitude,
                lng: destRoute.bus_stops.longitude,
              }
            : undefined;

        // Create URL for only the selected route segment (source to destination)
        googleMapsUrl = googleMapsUtils.createJourneyUrl(
          source,
          destination,
          selectedBus as any,
          sourceCoords,
          destCoords,
        );
      } else {
        // Fallback to simple directions if no bus data
        const encodedSource = encodeURIComponent(`${source}, Jodhpur, Rajasthan`);
        const encodedDest = encodeURIComponent(`${destination}, Jodhpur, Rajasthan`);
        googleMapsUrl = `https://www.google.com/maps/dir/${encodedSource}/${encodedDest}?hl=en&entry=ttu&travelmode=transit`;
      }

      const canOpen = await Linking.canOpenURL(googleMapsUrl);
      if (canOpen) {
        await Linking.openURL(googleMapsUrl);
      } else {
        Alert.alert(t('map_unavailable'), t('map_unavailable_message'), [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('open_browser'),
            onPress: () => Linking.openURL(googleMapsUrl),
          },
        ]);
      }
    } catch (error) {
      console.error('Error opening Google Maps:', error);
      Alert.alert(t('error'), t('map_error_message'));
    }
  };
  return (
    <View style={styles.container}>
      {/* Map Controls & Legend - Above Map */}
      <View style={styles.mapHeaderSection}>
        {/* Map Legend */}
        <View style={[styles.mapLegend, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <View style={styles.legendHeader}>
            <Icon name="information-circle" size={16} color={theme.colors.primary} />
            <Text style={[styles.mapLegendTitle, { color: theme.colors.text }]}>
              {t('map_legend')}
            </Text>
          </View>
          <View style={styles.mapLegendItems}>
            <View style={styles.mapLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.mapLegendText, { color: theme.colors.textSecondary }]}>
                {t('start_label')}
              </Text>
            </View>
            <View style={styles.mapLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F44336' }]} />
              <Text style={[styles.mapLegendText, { color: theme.colors.textSecondary }]}>
                {t('end_label')}
              </Text>
            </View>
            <View style={styles.mapLegendItem}>
              <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.mapLegendText, { color: theme.colors.textSecondary }]}>
                {t('bus_stops')}
              </Text>
            </View>
          </View>
        </View>

        {/* External Map Button */}
        <TouchableOpacity
          style={[
            styles.externalMapButton,
            {
              borderColor: theme.colors.primary,
              backgroundColor: theme.colors.background,
            },
          ]}
          onPress={() => openGoogleMaps()}
          activeOpacity={0.8}
        >
          <Icon
            name="map-outline"
            size={18}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.externalMapText,
              { color: theme.colors.primary },
            ]}
          >
            {selectedBus.name 
              ? `${t('open_route_for')} ${selectedBus.name}`
              : t('open_selected_route_in_maps')
            }
          </Text>
        </TouchableOpacity>
      </View>

      {/* Interactive Map */}
      {hasValidCoordinates ? (
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={mapRegion}
            showsUserLocation={hasLocationPermission}
            showsMyLocationButton={hasLocationPermission}
            showsCompass={true}
            showsScale={true}
            showsBuildings={true}
            showsTraffic={false}
            onMapReady={() => setMapReady(true)}
          >
            {/* Route Polyline - Only for selected journey segment */}
            {journeyStops.length > 1 && (
              <Polyline
                coordinates={journeyStops.map(route => ({
                  latitude: Number(route.bus_stops!.latitude!),
                  longitude: Number(route.bus_stops!.longitude!),
                }))}
                strokeColor={theme.colors.primary}
                strokeWidth={4}
                lineDashPattern={[5, 5]}
              />
            )}

            {/* Bus Stop Markers - Only for selected journey segment */}
            {mapReady && journeyStops.map((routeStop, index) => {
              const lat = Number(routeStop.bus_stops!.latitude!);
              const lng = Number(routeStop.bus_stops!.longitude!);
              
              const isSourceStop = routeStop.bus_stops!.name === source;
              const isDestStop = routeStop.bus_stops!.name === destination;

              return (
                <Marker
                  key={`marker-${index}-${routeStop.bus_stops!.name}`}
                  coordinate={{
                    latitude: lat,
                    longitude: lng,
                  }}
                  title={routeStop.bus_stops!.name}
                  description={routeStop.bus_stops!.address || `Stop #${routeStop.stop_order || index + 1}`}
                >
                  <View style={[
                    styles.customMarker,
                    {
                      backgroundColor: isSourceStop 
                        ? '#4CAF50' 
                        : isDestStop 
                        ? '#F44336' 
                        : theme.colors.primary,
                      borderColor: '#fff',
                    }
                  ]}>
                    <Icon 
                      name={
                        isSourceStop 
                          ? 'location' 
                          : isDestStop 
                          ? 'flag' 
                          : 'bus'
                      } 
                      size={12} 
                      color="#fff" 
                    />
                  </View>
                </Marker>
              );
            })}
          </MapView>

          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity
              style={[styles.mapControlButton, { backgroundColor: theme.colors.card }]}
              onPress={() => openGoogleMaps()}
            >
              <Icon name="open" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Fallback UI when no valid coordinates */
        <View style={[styles.mapFallback, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Icon name="map-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.mapFallbackTitle, { color: theme.colors.text }]}>
            {t('map_unavailable')}
          </Text>
          <Text style={[styles.mapFallbackText, { color: theme.colors.textSecondary }]}>
            {t('map_coordinates_unavailable')}
          </Text>
          <TouchableOpacity
            style={[styles.mapFallbackButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => openGoogleMaps()}
          >
            <Icon name="open" size={16} color="#fff" />
            <Text style={styles.mapFallbackButtonText}>
              {selectedBus.name 
                ? `${t('open_route_for')} ${selectedBus.name}`
                : t('open_selected_route_in_maps')
              }
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    paddingVertical: 8,
  },
  // Map Header Section Styles
  mapHeaderSection: {
    gap: 8,
    marginBottom: 8,
  },
  externalMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  externalMapText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Map Container Styles
  mapContainer: {
    height: Dimensions.get('window').height * 0.55, // Reduced to 55% to account for header section
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  customMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 8,
  },
  mapControlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mapLegend: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  legendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  mapLegendTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  mapLegendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mapLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  mapLegendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2.5,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  mapFallback: {
    height: Dimensions.get('window').height * 0.55, // Reduced to match map container
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  mapFallbackTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  mapFallbackText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mapFallbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 8,
  },
  mapFallbackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MapTab;