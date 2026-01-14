import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Animated,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { busStopsApi, busesApi } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { createTheme } from '../themes';

interface BusResult {
  buses?: Array<{ id: string; name: string }>;
  message?: string;
}

type RootStackParamList = {
  AddRoute: undefined;
  Result: { busRoute: BusResult; source: string; destination: string };
};

const MainComponent = () => {
  const [sourceExpanded, setSourceExpanded] = useState<boolean>(false);
  const [destinationExpanded, setDestinationExpanded] =
    useState<boolean>(false);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('');
  const [jodhpurPlaces, setJodhpurPlaces] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sourceSearch, setSourceSearch] = useState<string>('');
  const [destinationSearch, setDestinationSearch] = useState<string>('');
  const [swapAnimation] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [pulseAnim] = useState(new Animated.Value(1));
  const { isDark } = useTheme();
  const { t, language } = useLanguage();
  const theme = createTheme(isDark);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
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

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔍 Fetching bus stops...');
        const data = await busStopsApi.getAll(language);
        console.log('📍 Bus stops received:', data);
        const allNames = data.map(busStop => busStop.name);
        console.log('📝 Bus stop names:', allNames);
        setJodhpurPlaces(allNames);

        setSelectedSource('');
        setSelectedDestination('');
        setSourceExpanded(false);
        setDestinationExpanded(false);
        setSourceSearch('');
        setDestinationSearch('');
      } catch (error) {
        console.error('❌ Error fetching bus stops:', error);
      }
    }
    fetchData();
  }, [language]);

  // Pulse animation for the button when both locations are selected
  useEffect(() => {
    if (
      selectedSource &&
      selectedDestination &&
      selectedSource !== selectedDestination
    ) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [selectedSource, selectedDestination]);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleGetBusClick = async () => {
    if (
      selectedSource &&
      selectedDestination &&
      selectedSource !== selectedDestination
    ) {
      setLoading(true);
      try {
        console.log(
          '🔍 Searching buses from:',
          selectedSource,
          'to:',
          selectedDestination,
        );
        const result = await busesApi.findByStops(
          selectedSource,
          selectedDestination,
        );
        console.log('🚌 Search result:', result);

        navigation.navigate('Result', {
          busRoute: result,
          source: selectedSource,
          destination: selectedDestination,
        });
      } catch (error) {
        console.error('❌ Error fetching bus route:', error);
        const errorResult = {
          message: t('error') + '. ' + t('try_different_route'),
        };

        navigation.navigate('Result', {
          busRoute: errorResult,
          source: selectedSource,
          destination: selectedDestination,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const selectSource = (place: string) => {
    setSelectedSource(place);
    setSourceExpanded(false);
    setSourceSearch('');

    // Haptic feedback simulation with animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const selectDestination = (place: string) => {
    setSelectedDestination(place);
    setDestinationExpanded(false);
    setDestinationSearch('');

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.9,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleSourceList = () => {
    if (destinationExpanded) {
      setDestinationExpanded(false);
      setDestinationSearch('');
    }
    setSourceExpanded(!sourceExpanded);
    if (sourceExpanded) {
      setSourceSearch('');
    }
  };

  const toggleDestinationList = () => {
    if (sourceExpanded) {
      setSourceExpanded(false);
      setSourceSearch('');
    }
    setDestinationExpanded(!destinationExpanded);
    if (destinationExpanded) {
      setDestinationSearch('');
    }
  };

  const swapLocations = () => {
    if (selectedSource || selectedDestination) {
      Animated.sequence([
        Animated.timing(swapAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(swapAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const temp = selectedSource;
      setSelectedSource(selectedDestination);
      setSelectedDestination(temp);
    }
  };

  const clearSelections = () => {
    setSelectedSource('');
    setSelectedDestination('');
    setSourceExpanded(false);
    setDestinationExpanded(false);
    setSourceSearch('');
    setDestinationSearch('');
  };

  const getFilteredPlaces = (searchTerm: string, excludePlace?: string) => {
    let filtered = jodhpurPlaces;

    if (excludePlace) {
      filtered = filtered.filter(place => place !== excludePlace);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(place =>
        place.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  const renderLocationSelector = (
    type: 'source' | 'destination',
    expanded: boolean,
    selected: string,
    search: string,
    onToggle: () => void,
    onSelect: (place: string) => void,
    onSearchChange: (text: string) => void,
  ) => {
    const isSource = type === 'source';
    const icon = isSource ? 'location' : 'flag';
    const iconColor = isSource ? theme.colors.primary : theme.colors.success;
    const placeholder = isSource ? t('select_source') : t('select_destination');
    const excludePlace = isSource ? selectedDestination : selectedSource;

    return (
      <View style={[styles.selectorContainer, expanded && { zIndex: 5000 }]}>
        <TouchableOpacity
          style={[
            styles.selectorButton,
            {
              borderColor: expanded ? iconColor : theme.colors.border,
              backgroundColor: theme.colors.background,
              borderWidth: expanded ? 2 : 1,
            },
            selected &&
              !expanded && {
                backgroundColor: theme.colors.background,
                borderColor: iconColor,
                borderWidth: 2,
              },
          ]}
          onPress={onToggle}
          activeOpacity={0.7}
        >
          <View style={styles.selectorContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: iconColor + '20' },
              ]}
            >
              <Icon name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.selectorLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {isSource ? t('from') : t('to')}
              </Text>
              <Text
                style={
                  selected
                    ? [
                        styles.selectedLocationText,
                        { color: theme.colors.text },
                      ]
                    : [
                        styles.placeholderLocationText,
                        { color: theme.colors.textSecondary },
                      ]
                }
                numberOfLines={1}
              >
                {selected || placeholder}
              </Text>
            </View>
            {selected && !expanded ? (
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  isSource ? setSelectedSource('') : setSelectedDestination('');
                }}
                style={styles.clearButton}
              >
                <Icon
                  name="close-circle"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            ) : (
              <Icon
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.colors.textSecondary}
              />
            )}
          </View>
        </TouchableOpacity>

        {expanded && (
          <Modal
            visible={expanded}
            transparent={true}
            animationType="fade"
            onRequestClose={onToggle}
          >
            <TouchableWithoutFeedback onPress={onToggle}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View
                    style={[
                      styles.dropdownContainer,
                      {
                        backgroundColor: theme.colors.card,
                        borderColor: iconColor,
                      },
                    ]}
                  >
                    <View style={styles.dropdownHeader}>
                      <Text style={[styles.dropdownTitle, { color: theme.colors.text }]}>
                        {isSource ? t('from') : t('to')}
                      </Text>
                      <TouchableOpacity onPress={onToggle}>
                        <Icon name="close" size={24} color={theme.colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                    <View
                      style={[
                        styles.searchContainer,
                        { borderBottomColor: theme.colors.border },
                      ]}
                    >
                      <Icon
                        name="search"
                        size={18}
                        color={theme.colors.textSecondary}
                      />
                      <TextInput
                        style={[styles.searchInput, { color: theme.colors.text }]}
                        placeholder={
                          isSource
                            ? t('search_starting_point')
                            : t('search_destination')
                        }
                        placeholderTextColor={theme.colors.textSecondary}
                        value={search}
                        onChangeText={onSearchChange}
                        autoFocus={true}
                      />
                      {search.length > 0 && (
                        <TouchableOpacity onPress={() => onSearchChange('')}>
                          <Icon
                            name="close-circle"
                            size={18}
                            color={theme.colors.textSecondary}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <FlatList
                      data={getFilteredPlaces(search, excludePlace)}
                      keyExtractor={(item: string, index: number) =>
                        `${item}-${index}`
                      }
                      renderItem={({ item: place }: { item: string }) => (
                        <TouchableOpacity
                          style={[
                            styles.placeItem,
                            { borderBottomColor: theme.colors.border },
                          ]}
                          onPress={() => onSelect(place)}
                          activeOpacity={0.6}
                        >
                          <View
                            style={[
                              styles.placeIconContainer,
                              { backgroundColor: iconColor + '15' },
                            ]}
                          >
                            <Icon
                              name="location-outline"
                              size={16}
                              color={iconColor}
                            />
                          </View>
                          <Text
                            style={[
                              styles.placeItemText,
                              { color: theme.colors.text },
                            ]}
                          >
                            {place}
                          </Text>
                          <Icon
                            name="chevron-forward"
                            size={16}
                            color={theme.colors.textSecondary}
                          />
                        </TouchableOpacity>
                      )}
                      ListEmptyComponent={
                        <View style={styles.noResultsContainer}>
                          <Icon
                            name="search"
                            size={32}
                            color={theme.colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.noResultsText,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {t('no_places_found')}
                          </Text>
                        </View>
                      }
                      style={styles.placesList}
                      showsVerticalScrollIndicator={true}
                      keyboardShouldPersistTaps="handled"
                    />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <Image source={require('../images/jodhpur.jpg')} style={styles.image} />

        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.contentContainer,
              {
                backgroundColor: theme.colors.card,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.headerContainer}>
              <Text
                style={[styles.subtitle, { color: theme.colors.textSecondary }]}
              >
                {t('app_description')}
              </Text>
              {(selectedSource || selectedDestination) && (
                <TouchableOpacity
                  onPress={clearSelections}
                  style={styles.clearAllButton}
                >
                  <Text
                    style={[
                      styles.clearAllText,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {t('clear_all') || 'Clear All'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputContainer}>
              {renderLocationSelector(
                'source',
                sourceExpanded,
                selectedSource,
                sourceSearch,
                toggleSourceList,
                selectSource,
                setSourceSearch,
              )}

              <View style={styles.swapButtonContainer}>
                <Animated.View
                  style={[
                    styles.swapButton,
                    {
                      backgroundColor: theme.colors.primary,
                      transform: [
                        {
                          rotate: swapAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.swapButtonTouchable}
                    onPress={swapLocations}
                    disabled={!selectedSource && !selectedDestination}
                    activeOpacity={0.8}
                  >
                    <Icon name="swap-vertical" size={22} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {renderLocationSelector(
                'destination',
                destinationExpanded,
                selectedDestination,
                destinationSearch,
                toggleDestinationList,
                selectDestination,
                setDestinationSearch,
              )}

              {selectedSource && selectedDestination && (
                <View
                  style={[
                    styles.routePreview,
                    {
                      backgroundColor: theme.colors.primary + '10',
                      borderColor: theme.colors.primary + '30',
                    },
                  ]}
                >
                  <Icon
                    name="navigate"
                    size={18}
                    color={theme.colors.primary}
                  />
                  <Text
                    style={[
                      styles.routePreviewText,
                      { color: theme.colors.primary },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedSource} → {selectedDestination}
                  </Text>
                </View>
              )}

              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  style={[
                    styles.findBusButton,
                    { backgroundColor: theme.colors.primary },
                    (!selectedSource ||
                      !selectedDestination ||
                      selectedSource === selectedDestination) && [
                      styles.buttonDisabled,
                      { backgroundColor: theme.colors.border },
                    ],
                  ]}
                  onPress={handleGetBusClick}
                  disabled={
                    !selectedSource ||
                    !selectedDestination ||
                    selectedSource === selectedDestination ||
                    loading
                  }
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <View style={styles.buttonContent}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={styles.buttonText}>
                        {t('searching') || 'Searching...'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.buttonContent}>
                      <Icon name="bus" size={24} color="#fff" />
                      <Text style={styles.buttonText}>{t('find_buses')}</Text>
                      <Icon name="arrow-forward" size={20} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'left',
    lineHeight: 22,
    flex: 1,
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    width: '100%',
  },
  selectorContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  selectorButton: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  selectedLocationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  placeholderLocationText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  dropdownContainer: {
    width: '90%',
    maxHeight: '70%',
    borderRadius: 16,
    borderWidth: 2,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  placesList: {
    flexGrow: 1,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  placeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  noResultsText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  swapButtonContainer: {
    alignItems: 'center',
    marginVertical: 10,
    zIndex: 1000,
  },
  swapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  swapButtonTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginVertical: 16,
    gap: 10,
  },
  routePreviewText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  findBusButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
    elevation: 2,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
});

export default MainComponent;
