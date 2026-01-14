import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Language types
export type Language = 'en' | 'hi';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
}

// Translation keys interface
interface Translations {
  [key: string]: {
    en: string;
    hi: string;
  };
}

// Static translations for the app
const translations: Translations = {
  // App basics
  app_name: {
    en: 'Jodhpur Bus Routes',
    hi: 'जोधपुर बस रूट्स'
  },
  app_description: {
    en: 'Find buses between any two stops in Jodhpur',
    hi: 'जोधपुर में किसी भी दो स्टॉप्स के बीच बस ढूंढिये'
  },
  
  // Navigation and UI
  from: {
    en: 'From',
    hi: 'से'
  },
  to: {
    en: 'To',
    hi: 'तक'
  },
  select_source: {
    en: 'Select Starting Point',
    hi: 'स्टार्टिंग पॉइंट सेलेक्ट करिये'
  },
  select_destination: {
    en: 'Select Destination',
    hi: 'डेस्टिनेशन सेलेक्ट करिये'
  },
  find_buses: {
    en: 'Find Buses',
    hi: 'बस ढूंढिये'
  },
  search_starting_point: {
    en: 'Search starting point...',
    hi: 'स्टार्टिंग पॉइंट सर्च करिये...'
  },
  search_destination: {
    en: 'Search destination...',
    hi: 'डेस्टिनेशन सर्च करिये...'
  },
  no_places_found: {
    en: 'No places found',
    hi: 'कोई प्लेस नहीं मिली'
  },
  search_results: {
    en: 'Search Results',
    hi: 'सर्च रिजल्ट्स'
  },
  home: {
    en: 'Home',
    hi: 'होम'
  },
  route_map: {
    en: 'Route Map',
    hi: 'रूट मैप'
  },
  add_route: {
    en: 'Add Route',
    hi: 'रूट ऐड करिये'
  },
  
  // Drawer menu
  help_support: {
    en: 'Help & Support',
    hi: 'हेल्प और सपोर्ट'
  },
  rate_review: {
    en: 'Rate & Review',
    hi: 'रेटिंग और रिव्यू'
  },
  share_app: {
    en: 'Share App',
    hi: 'ऐप शेयर करिये'
  },
  theme: {
    en: 'Theme',
    hi: 'थीम'
  },
  language: {
    en: 'Language',
    hi: 'लैंग्वेज'
  },
  light: {
    en: 'Light',
    hi: 'लाइट'
  },
  dark: {
    en: 'Dark',
    hi: 'डार्क'
  },
  english: {
    en: 'English',
    hi: 'इंग्लिश'
  },
  hindi: {
    en: 'हिंदी',
    hi: 'हिंदी'
  },
  
  clear_all: {
    en: 'Clear All',
    hi: 'सब क्लियर करें'
  },
  // Common states
  loading: {
    en: 'Loading...',
    hi: 'लोड हो रहा है...'
  },
  error: {
    en: 'Error',
    hi: 'एरर'
  },
  no_buses_found: {
    en: 'No buses found for this route',
    hi: 'इस रूट के लिये कोई बस नहीं मिली'
  },
  try_different_route: {
    en: 'Please try a different route',
    hi: 'कोई और रूट ट्राई करिये'
  },
  try_again: {
    en: 'Try Again',
    hi: 'फिर से ट्राई करिये'
  },
  
  // Add route screen
  add_route_help: {
    en: 'Please Help Us to Add More Routes 🙏',
    hi: 'हमें और रूट्स ऐड करने में हेल्प करिये 🙏'
  },
  route_name: {
    en: 'Route Name',
    hi: 'रूट का नाम'
  },
  start_point: {
    en: 'Start Point',
    hi: 'स्टार्टिंग पॉइंट'
  },
  end_point: {
    en: 'End Point',
    hi: 'एंडिंग पॉइंट'
  },
  major_stops: {
    en: 'Major Stops (Optional)',
    hi: 'मेजर स्टॉप्स (ऑप्शनल)'
  },
  your_contact: {
    en: 'Your Contact (Optional)',
    hi: 'आपका कॉन्टैक्ट (ऑप्शनल)'
  },
  additional_info: {
    en: 'Additional Information (Optional)',
    hi: 'एक्स्ट्रा इन्फॉर्मेशन (ऑप्शनल)'
  },
  submit_route: {
    en: 'Submit Route Suggestion',
    hi: 'रूट सजेशन सबमिट करिये'
  },
  required_fields: {
    en: 'Required fields',
    hi: 'जरूरी फील्ड्स'
  },
  thank_you: {
    en: 'Thank You! 🙏',
    hi: 'थैंक यू! 🙏'
  },
  route_submitted: {
    en: 'Your route suggestion has been submitted. We will review it and add it to our system soon.',
    hi: 'आपका रूट सजेशन सबमिट हो गया है। हम इसे रिव्यू करके जल्दी सिस्टम में ऐड कर देंगे।'
  },
  missing_info: {
    en: 'Missing Information',
    hi: 'इन्फॉर्मेशन मिसिंग है'
  },
  fill_required_fields: {
    en: 'Please fill in at least the route name, start point, and end point.',
    hi: 'प्लीज रूट नाम, स्टार्ट पॉइंट और एंड पॉइंट जरूर फिल करिये।'
  },
  route_name_placeholder: {
    en: 'e.g., Jodhpur to Mandore',
    hi: 'जैसे, जोधपुर से मंडोर'
  },
  start_point_placeholder: {
    en: 'e.g., Railway Station',
    hi: 'जैसे, रेलवे स्टेशन'
  },
  end_point_placeholder: {
    en: 'e.g., Mandore Garden',
    hi: 'जैसे, मंडोर गार्डन'
  },
  major_stops_placeholder: {
    en: 'List major stops along the route, separated by commas',
    hi: 'रूट के मेजर स्टॉप्स लिस्ट करिये, कॉमा से सेपरेट करके'
  },
  contact_placeholder: {
    en: 'Phone or email (for follow-up questions)',
    hi: 'फोन या ईमेल (फॉलो-अप क्वेश्चन्स के लिये)'
  },
  additional_info_placeholder: {
    en: 'Any additional details about the route, timings, or bus operators',
    hi: 'रूट, टाइमिंग या बस ऑपरेटर्स के बारे में कोई एक्स्ट्रा डिटेल्स'
  },
  
  // Common actions
  ok: {
    en: 'OK',
    hi: 'ओके'
  },
  cancel: {
    en: 'Cancel',
    hi: 'कैंसल'
  },
  
  // Map and navigation
  fare_info: {
    en: 'Fare Information',
    hi: 'किराया जानकारी'
  },
  map_unavailable: {
    en: 'Maps Unavailable',
    hi: 'मैप्स उपलब्ध नहीं'
  },
  map_unavailable_message: {
    en: 'Google Maps app is not available. Would you like to open in browser?',
    hi: 'गूगल मैप्स ऐप उपलब्ध नहीं है। क्या आप ब्राउज़र में खोलना चाहते हैं?'
  },
  open_browser: {
    en: 'Open Browser',
    hi: 'ब्राउज़र खोलें'
  },
  map_error_message: {
    en: 'Unable to open maps. Please try again.',
    hi: 'मैप्स खोलने में असमर्थ। कृपया फिर से कोशिश करें।'
  },
  
  // Version and footer
  version: {
    en: 'Version 1.0.0',
    hi: 'वर्जन 1.0.0'
  },
  
  // Result Screen - Fare
  estimated_fare: {
    en: 'Estimated Fare',
    hi: 'किराया'
  },
  stops: {
    en: 'stops',
    hi: 'स्टॉप'
  },
  
  // Result Screen - Tabs
  tab_info: {
    en: 'Info',
    hi: 'जानकारी'
  },
  tab_stops: {
    en: 'Stops',
    hi: 'स्टॉप्स'
  },
  tab_tips: {
    en: 'Tips',
    hi: 'टिप्स'
  },
  tab_map: {
    en: 'Map',
    hi: 'मैप'
  },
  
  // Result Screen - Info Tab
  description: {
    en: 'Description',
    hi: 'जानकारी'
  },
  highlights: {
    en: 'Highlights',
    hi: 'खास बातें'
  },
  
  // Result Screen - Stops Tab
  start_label: {
    en: 'Start',
    hi: 'शुरू'
  },
  end_label: {
    en: 'End',
    hi: 'अंत'
  },
  no_tips_available: {
    en: 'No tips available',
    hi: 'कोई टिप्स नहीं मिली'
  },
  
  // Result Screen - Map buttons
  view_journey_map: {
    en: 'View Journey Map',
    hi: 'जर्नी मैप देखें'
  },
  view_full_route: {
    en: 'View Full Route',
    hi: 'पूरा रास्ता देखें'
  },
  route_overview: {
    en: 'Route Overview',
    hi: 'रास्ते की जानकारी'
  },
  distance: {
    en: 'Distance',
    hi: 'दूरी'
  },
  map_info: {
    en: 'Map Info',
    hi: 'मैप जानकारी'
  },
  map_info_description: {
    en: 'Tap buttons above to open Google Maps with your route or the complete bus route.',
    hi: 'ऊपर के बटन दबाकर गूगल मैप्स में अपना रास्ता या पूरा बस रूट देखें।'
  },
  map_legend: {
    en: 'Map Legend',
    hi: 'मैप लेजेंड'
  },
  bus_stops: {
    en: 'Bus Stops',
    hi: 'बस स्टॉप्स'
  },
  open_in_google_maps: {
    en: 'Open in Google Maps',
    hi: 'गूगल मैप्स में खोलें'
  },
  map_coordinates_unavailable: {
    en: 'Map coordinates are not available for this route. You can still view the route in Google Maps.',
    hi: 'इस रूट के लिए मैप कोऑर्डिनेट्स उपलब्ध नहीं हैं। आप अभी भी गूगल मैप्स में रूट देख सकते हैं।'
  },
  open_selected_route_in_maps: {
    en: 'Open Selected Route in Maps',
    hi: 'सेलेक्टेड रूट मैप्स में खोलें'
  },
  open_route_for: {
    en: 'Open Route for',
    hi: 'रूट खोलें'
  },
  showing_route_for: {
    en: 'Showing route for',
    hi: 'रूट दिखाया जा रहा है'
  },
  journey_overview: {
    en: 'Journey Overview',
    hi: 'यात्रा की जानकारी'
  },
  total_stops: {
    en: 'Total Stops',
    hi: 'कुल स्टॉप्स'
  },
  intermediate_stops: {
    en: 'Intermediate',
    hi: 'बीच के स्टॉप्स'
  },
  attractions_along_route: {
    en: 'Attractions Along Route',
    hi: 'रास्ते में घूमने की जगह'
  },
  facilities_available: {
    en: 'Facilities Available',
    hi: 'उपलब्ध सुविधाएं'
  },
  nearby_landmarks: {
    en: 'Nearby Landmarks',
    hi: 'पास की जगहें'
  },
  stop_details: {
    en: 'Stop Details',
    hi: 'स्टॉप की जानकारी'
  },
  no_journey_info: {
    en: 'No journey information available',
    hi: 'यात्रा की जानकारी उपलब्ध नहीं'
  },
  journey_tips: {
    en: 'Journey Tips',
    hi: 'यात्रा के टिप्स'
  },
  safety_tips: {
    en: 'Safety Tips',
    hi: 'सुरक्षा के टिप्स'
  },
  your_journey: {
    en: 'Your Journey',
    hi: 'आपकी यात्रा'
  },
  journey_info: {
    en: 'Journey Info',
    hi: 'यात्रा की जानकारी'
  },
  estimated_time: {
    en: 'Est. Time',
    hi: 'लगभग समय'
  },
  gps_calculated: {
    en: 'GPS Calculated',
    hi: 'GPS से कैलकुलेट'
  },
  estimated: {
    en: 'Estimated',
    hi: 'लगभग'
  },
  
  // Result Screen - Stop details
  arrival: {
    en: 'Arrival',
    hi: 'आना'
  },
  departure: {
    en: 'Departure',
    hi: 'जाना'
  },
  attractions: {
    en: 'Attractions',
    hi: 'घूमने की जगह'
  },
  facilities: {
    en: 'Facilities',
    hi: 'सुविधा'
  },
  nearby: {
    en: 'Nearby',
    hi: 'पास में'
  },
  
  // Results Summary
  buses_available: {
    en: 'Buses Available',
    hi: 'बसें मिली'
  },
  bus_available: {
    en: 'Bus Available', 
    hi: 'बस मिली'
  },
  select_bus_to_view: {
    en: 'Select a bus to view route details',
    hi: 'बस चुनें और रास्ता देखें'
  },
  
  // Bus Schedule
  continuous: {
    en: 'Continuous',
    hi: 'लगातार'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = '@jodhpur_rides_language';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load saved language on app start
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
        setLanguageState(savedLanguage as Language);
      }
    } catch (error) {
      console.error('Error loading saved language:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Translation function
  const t = (key: string, fallback?: string): string => {
    const translation = translations[key];
    if (translation && translation[language]) {
      return translation[language];
    }
    
    // Fallback to English if Hindi translation not available
    if (language === 'hi' && translation && translation.en) {
      return translation.en;
    }
    
    // Return fallback or key if no translation found
    return fallback || key;
  };

  // Check if current language is RTL (Hindi is LTR, but keeping for future languages)
  const isRTL = false; // Both English and Hindi are LTR

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Helper function to get localized content from API data
export const getLocalizedContent = (
  content: any,
  language: Language,
  field: string
): string => {
  if (!content) return '';
  
  const localizedField = language === 'hi' ? `${field}_hi` : field;
  return content[localizedField] || content[field] || '';
};

// Helper function to get localized array content
export const getLocalizedArray = (
  content: any,
  language: Language,
  field: string
): string[] => {
  if (!content) return [];
  
  const localizedField = language === 'hi' ? `${field}_hi` : field;
  const result = content[localizedField] || content[field];
  
  return Array.isArray(result) ? result : [];
};

export default LanguageContext;