import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTheme } from '../../themes';

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
  bus_routes?: RouteStop[];
}

interface StopsTabProps {
  selectedBus: RouteDetails;
  source: string;
  destination: string;
}

const StopsTab: React.FC<StopsTabProps> = ({ selectedBus, source, destination }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const theme = createTheme(isDark);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
      {selectedBus.bus_routes?.map((routeStop, stopIndex) => {
        const isSourceStop = routeStop.bus_stops?.name === source;
        const isDestStop = routeStop.bus_stops?.name === destination;

        // Find source and destination indices
        const sourceIndex = selectedBus.bus_routes?.findIndex(
          stop => stop.bus_stops?.name === source,
        ) || 0;
        const destIndex = selectedBus.bus_routes?.findIndex(
          stop => stop.bus_stops?.name === destination,
        ) || 0;

        // Only show stops between source and destination (inclusive)
        const minIndex = Math.min(sourceIndex, destIndex);
        const maxIndex = Math.max(sourceIndex, destIndex);
        const isInRange = stopIndex >= minIndex && stopIndex <= maxIndex;

        if (!isInRange) return null;

        const isHighlighted = isSourceStop || isDestStop;

        return (
          <View key={stopIndex} style={styles.stopItemCompact}>
            <View
              style={[
                styles.stopDotCompact,
                {
                  backgroundColor: isHighlighted
                    ? theme.colors.primary
                    : theme.colors.border,
                },
              ]}
            />
            <View style={styles.stopInfoCompact}>
              <Text
                style={[
                  styles.stopNameCompact,
                  {
                    color: isHighlighted ? theme.colors.primary : theme.colors.text,
                  },
                  isHighlighted && { fontWeight: '700' },
                ]}
              >
                {routeStop.bus_stops?.name || 'Unknown'}
              </Text>
              {(routeStop.arrival_time || routeStop.departure_time) && (
                <Text
                  style={[
                    styles.stopTimeCompact,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {routeStop.arrival_time?.slice(0, 5)} -{' '}
                  {routeStop.departure_time?.slice(0, 5)}
                </Text>
              )}
              {isSourceStop && (
                <View
                  style={[
                    styles.stopBadge,
                    { backgroundColor: theme.colors.primary + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.stopBadgeText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {t('start_label')}
                  </Text>
                </View>
              )}
              {isDestStop && (
                <View
                  style={[
                    styles.stopBadge,
                    { backgroundColor: theme.colors.success + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.stopBadgeText,
                      { color: theme.colors.success },
                    ]}
                  >
                    {t('end_label')}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.stopOrder,
                { color: theme.colors.textSecondary },
              ]}
            >
              #{routeStop.stop_order || stopIndex + 1}
            </Text>
          </View>
        );
      })}
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
  stopItemCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  stopDotCompact: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  stopInfoCompact: {
    flex: 1,
  },
  stopNameCompact: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopTimeCompact: {
    fontSize: 11,
    marginTop: 2,
  },
  stopBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  stopBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stopOrder: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StopsTab;