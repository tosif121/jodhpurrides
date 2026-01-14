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

interface TipsTabProps {
  selectedBus: RouteDetails;
  source: string;
  destination: string;
  calculatedFare: FareCalculation | null;
}

const TipsTab: React.FC<TipsTabProps> = ({ selectedBus, source, destination, calculatedFare }) => {
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  const theme = createTheme(isDark);

  // Generate journey-specific tips
  const getJourneyTips = () => {
    const tips: string[] = [];

    // Basic journey tips
    if (language === 'hi') {
      tips.push('बस में चढ़ने से पहले कंडक्टर से किराया पूछ लें');
      tips.push('भीड़ के समय में थोड़ा जल्दी निकलें');
      tips.push('अपना सामान हमेशा अपने पास रखें');
      
      if (calculatedFare) {
        if (calculatedFare.calculation_method === 'gps') {
          tips.push(`यह रूट लगभग ${calculatedFare.distance_km} किमी का है`);
        }
        tips.push(`लगभग किराया ₹${calculatedFare.fare_amount} है`);
        
        if (calculatedFare.distance_stops > 5) {
          tips.push('यह एक लंबा रूट है, आराम से बैठने की जगह ढूंढें');
        }
      }
      
      // Time-based tips
      const currentHour = new Date().getHours();
      if (currentHour >= 7 && currentHour <= 9) {
        tips.push('सुबह का समय है, ऑफिस जाने वालों की भीड़ हो सकती है');
      } else if (currentHour >= 17 && currentHour <= 19) {
        tips.push('शाम का समय है, घर जाने वालों की भीड़ हो सकती है');
      } else if (currentHour >= 12 && currentHour <= 14) {
        tips.push('दोपहर का समय है, बसें कम भीड़ में मिलेंगी');
      }
      
      tips.push('बस स्टॉप पर बस का नंबर चेक करके ही चढ़ें');
      tips.push('अगर कोई समस्या हो तो कंडक्टर या ड्राइवर से पूछें');
    } else {
      tips.push('Ask the conductor about the fare before boarding');
      tips.push('Leave a bit early during rush hours');
      tips.push('Keep your belongings close to you at all times');
      
      if (calculatedFare) {
        if (calculatedFare.calculation_method === 'gps') {
          tips.push(`This route is approximately ${calculatedFare.distance_km} km long`);
        }
        tips.push(`Estimated fare is ₹${calculatedFare.fare_amount}`);
        
        if (calculatedFare.distance_stops > 5) {
          tips.push('This is a longer route, try to find a comfortable seat');
        }
      }
      
      // Time-based tips
      const currentHour = new Date().getHours();
      if (currentHour >= 7 && currentHour <= 9) {
        tips.push('Morning hours - expect office-going crowd');
      } else if (currentHour >= 17 && currentHour <= 19) {
        tips.push('Evening hours - expect homeward-bound crowd');
      } else if (currentHour >= 12 && currentHour <= 14) {
        tips.push('Afternoon hours - buses are usually less crowded');
      }
      
      tips.push('Check the bus number at the stop before boarding');
      tips.push('Ask the conductor or driver if you need any help');
    }

    return tips;
  };

  const journeyTips = getJourneyTips();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Journey-specific tips */}
        <View style={styles.tipsHeader}>
          <Icon name="bulb" size={20} color={theme.colors.warning} />
          <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
            {t('journey_tips')}
          </Text>
        </View>
        
        {journeyTips.map((tip, idx) => (
          <View
            key={idx}
            style={[styles.tipCard, { backgroundColor: theme.colors.card }]}
          >
            <View
              style={[
                styles.tipNumberBadge,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Text style={styles.tipNumberText}>{idx + 1}</Text>
            </View>
            <Text
              style={[
                styles.tipText,
                { color: theme.colors.textSecondary },
              ]}
            >
              {tip}
            </Text>
          </View>
        ))}

        {/* Route-specific safety tips */}
        <View style={styles.safetySection}>
          <View style={styles.tipsHeader}>
            <Icon name="shield-checkmark" size={20} color={theme.colors.success} />
            <Text style={[styles.tipsTitle, { color: theme.colors.text }]}>
              {t('safety_tips')}
            </Text>
          </View>
          
          {(language === 'hi' ? [
            'बस में चढ़ते और उतरते समय सावधान रहें',
            'चलती बस में खड़े होकर यात्रा न करें',
            'अपना फोन और पैसे सुरक्षित जगह रखें',
            'बस में धूम्रपान न करें',
          ] : [
            'Be careful while boarding and alighting the bus',
            'Avoid standing while the bus is moving',
            'Keep your phone and money in a safe place',
            'No smoking inside the bus',
          ]).map((tip, idx) => (
            <View
              key={`safety-${idx}`}
              style={[styles.tipCard, { backgroundColor: theme.colors.success + '10' }]}
            >
              <View
                style={[
                  styles.tipNumberBadge,
                  { backgroundColor: theme.colors.success },
                ]}
              >
                <Icon name="shield-checkmark" size={12} color="#fff" />
              </View>
              <Text
                style={[
                  styles.tipText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {tip}
              </Text>
            </View>
          ))}
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
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  tipNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  safetySection: {
    marginTop: 20,
  },
});

export default TipsTab;