import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://crtlgbbkicmxjrtieyna.supabase.co';
const supabaseAnonKey = 'sb_publishable_uiogbh53irj_9ZE21iqGsQ_jyUYdSE_';

// Create Supabase client with error handling
let supabase: any = null;
let supabaseError: string | null = null;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  supabaseError = 'Supabase initialization failed';
}

export { supabase };

// Fare calculation utilities
export interface FareCalculation {
  fare_amount: number;
  distance_stops: number;
  distance_km: number;
  is_approximate: boolean;
  calculation_method: 'gps' | 'stops' | 'default';
}

export const fareCalculator = {
  // Base fare and per-km rate
  baseFare: 5, // ₹5 base fare
  perKmRate: 3, // ₹3 per kilometer
  perStopRate: 2, // ₹2 per additional stop

  // Calculate distance between two GPS coordinates using Haversine formula
  // Then apply road distance multiplier for Indian city conditions
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightLineDistance = R * c;
    
    // Apply road distance multiplier for Indian historic cities like Jodhpur
    // Factors: narrow streets, traffic, detours, historic city layout, petrol costs
    // Using 1.0x as the route-based calculation already accounts for actual road paths
    return straightLineDistance * 1.0;
  },

  toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  // Calculate route distance by summing distances between consecutive stops
  calculateRouteDistance(
    sourceStop: string,
    destinationStop: string,
    busRoute: BusRoute,
  ): number {
    if (!busRoute.bus_routes || busRoute.bus_routes.length === 0) {
      return 0;
    }

    // Find source and destination indices (check both English and Hindi names)
    let sourceIndex = -1;
    let destIndex = -1;

    busRoute.bus_routes.forEach((route, index) => {
      if (route.bus_stops?.name === sourceStop || route.bus_stops?.name_hi === sourceStop) {
        sourceIndex = index;
      }
      if (route.bus_stops?.name === destinationStop || route.bus_stops?.name_hi === destinationStop) {
        destIndex = index;
      }
    });

    if (sourceIndex === -1 || destIndex === -1) {
      return 0;
    }

    // Get the route segment between source and destination
    const startIdx = Math.min(sourceIndex, destIndex);
    const endIdx = Math.max(sourceIndex, destIndex);
    const routeSegment = busRoute.bus_routes.slice(startIdx, endIdx + 1);

    // Calculate total distance by summing distances between consecutive stops
    let totalDistance = 0;
    for (let i = 0; i < routeSegment.length - 1; i++) {
      const currentStop = routeSegment[i].bus_stops;
      const nextStop = routeSegment[i + 1].bus_stops;

      if (currentStop?.latitude && currentStop?.longitude && 
          nextStop?.latitude && nextStop?.longitude) {
        totalDistance += this.calculateDistance(
          currentStop.latitude,
          currentStop.longitude,
          nextStop.latitude,
          nextStop.longitude
        );
      }
    }

    return totalDistance;
  },

  calculateFare(
    sourceStop: string,
    destinationStop: string,
    busRoute: BusRoute,
  ): FareCalculation {
    if (!busRoute.bus_routes || busRoute.bus_routes.length === 0) {
      return {
        fare_amount: this.baseFare,
        distance_stops: 0,
        distance_km: 0,
        is_approximate: true,
        calculation_method: 'default',
      };
    }

    // Find source and destination stop details (check both English and Hindi names)
    let sourceRoute: any = null;
    let destinationRoute: any = null;

    busRoute.bus_routes.forEach(route => {
      // Check both English and Hindi names
      if (route.bus_stops?.name === sourceStop || route.bus_stops?.name_hi === sourceStop) {
        sourceRoute = route;
      }
      if (route.bus_stops?.name === destinationStop || route.bus_stops?.name_hi === destinationStop) {
        destinationRoute = route;
      }
    });

    // Calculate distance in stops
    const sourceOrder = sourceRoute?.stop_order || 0;
    const destinationOrder = destinationRoute?.stop_order || 0;
    const distanceStops = Math.abs(destinationOrder - sourceOrder);

    // Calculate route distance using consecutive stops (more accurate than straight line)
    const routeDistance = this.calculateRouteDistance(sourceStop, destinationStop, busRoute);

    let fareAmount: number;
    let distanceKm = 0;
    let isApproximate = false;
    let calculationMethod: 'gps' | 'stops' | 'default' = 'default';

    if (routeDistance > 0) {
      // Route-based calculation (most accurate - follows actual bus path)
      distanceKm = routeDistance;
      fareAmount = this.baseFare + Math.ceil(distanceKm * this.perKmRate);
      calculationMethod = 'gps';
      isApproximate = false;
    } else if (distanceStops > 0) {
      // Stop-based calculation (approximate)
      const additionalStops = Math.max(0, distanceStops - 1);
      fareAmount = this.baseFare + additionalStops * this.perStopRate;
      calculationMethod = 'stops';
      isApproximate = true;
    } else {
      // Default fare
      fareAmount = this.baseFare;
      calculationMethod = 'default';
      isApproximate = true;
    }

    return {
      fare_amount: Math.max(this.baseFare, fareAmount),
      distance_stops: distanceStops,
      distance_km: Math.round(distanceKm * 100) / 100,
      is_approximate: isApproximate,
      calculation_method: calculationMethod,
    };
  },

  formatFare(amount: number): string {
    return `₹${amount}`;
  },

  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
  },
};
// Google Maps integration utilities
export const googleMapsUtils = {
  // Create URL for specific route between source and destination with bus info
  createJourneyUrl(
    sourceStop: string,
    destinationStop: string,
    busRoute: BusRoute,
    sourceCoords?: { lat: number; lng: number },
    destCoords?: { lat: number; lng: number },
  ): string {
    if (!busRoute.bus_routes || busRoute.bus_routes.length === 0) {
      // Fallback to simple two-point route with bus info
      const source = sourceCoords
        ? `${sourceCoords.lat},${sourceCoords.lng}`
        : encodeURIComponent(`${sourceStop}, Jodhpur, Rajasthan`);
      const dest = destCoords
        ? `${destCoords.lat},${destCoords.lng}`
        : encodeURIComponent(`${destinationStop}, Jodhpur, Rajasthan`);

      const busName = busRoute.name ? encodeURIComponent(busRoute.name) : '';
      const busParam = busName ? `&bus=${busName}&transit_routing_preference=fewer_transfers` : '&transit_routing_preference=fewer_transfers';
      
      return `https://www.google.com/maps/dir/${source}/${dest}?hl=en&entry=ttu&travelmode=transit${busParam}`;
    }

    // Find source and destination indices in the route
    let sourceIndex = -1;
    let destIndex = -1;

    busRoute.bus_routes.forEach((route, index) => {
      if (route.bus_stops?.name === sourceStop) sourceIndex = index;
      if (route.bus_stops?.name === destinationStop) destIndex = index;
    });

    if (sourceIndex === -1 || destIndex === -1) {
      // Fallback if stops not found in route
      return this.createRouteUrl([
        { name: sourceStop },
        { name: destinationStop },
      ], busRoute.name);
    }

    // Get the route segment between source and destination
    const startIdx = Math.min(sourceIndex, destIndex);
    const endIdx = Math.max(sourceIndex, destIndex);
    const routeSegment = busRoute.bus_routes.slice(startIdx, endIdx + 1);

    return this.createRouteUrl(
      routeSegment.map(route => ({
        name: route.bus_stops?.name || '',
        latitude: route.bus_stops?.latitude,
        longitude: route.bus_stops?.longitude,
      })),
      busRoute.name
    );
  },

  // Create Google Maps directions URL with multiple waypoints and bus info
  createRouteUrl(
    stops: Array<{ name: string; latitude?: number; longitude?: number }>,
    busName?: string,
  ): string {
    if (stops.length === 0) return '';

    // Use coordinates if available, otherwise use place names
    const waypoints = stops.map(stop => {
      if (stop.latitude && stop.longitude) {
        return `${stop.latitude},${stop.longitude}`;
      }
      return encodeURIComponent(`${stop.name}, Jodhpur, Rajasthan`);
    });

    const baseUrl = 'https://www.google.com/maps/dir/';
    const waypointsStr = waypoints.join('/');

    const params = new URLSearchParams({
      hl: 'en',
      entry: 'ttu',
      travelmode: 'transit',
    });

    if (busName) {
      return `${baseUrl}${waypointsStr}?${params.toString()}&bus=${encodeURIComponent(busName)}&transit_routing_preference=fewer_transfers`;
    }

    return `${baseUrl}${waypointsStr}?${params.toString()}&transit_routing_preference=fewer_transfers`;
  },
};
// Types
export interface BusStop {
  id: string;
  name: string;
  name_hi?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  address_hi?: string;
}

export interface BusRoute {
  id: string;
  name: string;
  description?: string;
  route_overview?: string;
  highlights?: string[];
  travel_tips?: string[];
  fare_info?: {
    regular_fare?: string;
    student_fare?: string;
    senior_citizen_fare?: string;
    ac_bus_fare?: string;
  };
  bus_routes?: Array<{
    bus_stops?: BusStop & {
      description?: string;
      attractions?: string[];
      facilities?: string[];
      nearby_landmarks?: string[];
    };
    stop_order?: number;
    arrival_time?: string;
    departure_time?: string;
  }>;
}

export interface Bus {
  id: string;
  name: string;
}

export interface BusSearchResult {
  buses?: Bus[];
  message?: string;
}

// Bus Stops API
export const busStopsApi = {
  async getAll(language: string = 'en'): Promise<BusStop[]> {
    console.log('🔍 Getting bus stops for language:', language);

    if (!supabase || supabaseError) {
      throw new Error('Supabase not properly configured');
    }

    try {
      // Get bus stops in route order by joining with bus_routes table
      // First, get the bus ID for "Bus No. 15"
      const { data: busData, error: busError } = await supabase
        .from('buses')
        .select('id')
        .eq('name', 'Bus No. 15')
        .eq('is_active', true)
        .single();

      if (busError || !busData) {
        console.log('⚠️ Bus No. 15 not found, falling back to all stops');
        // Fallback to all stops if Bus 15 not found
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('bus_stops')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (fallbackError) throw fallbackError;
        return fallbackData || [];
      }

      // Get bus stops in route order using the actual bus ID
      const { data, error } = await supabase
        .from('bus_routes')
        .select(`
          bus_stops!inner(
            id,
            name,
            name_hi,
            latitude,
            longitude,
            address,
            address_hi,
            is_active,
            description,
            description_hi,
            attractions,
            attractions_hi,
            facilities,
            facilities_hi,
            nearby_landmarks,
            nearby_landmarks_hi
          ),
          stop_order
        `)
        .eq('bus_stops.is_active', true)
        .eq('bus_id', busData.id)
        .order('stop_order');

      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No bus route found, falling back to all stops');
        // Fallback to all stops if no route found
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('bus_stops')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (fallbackError) throw fallbackError;
        
        const isHindi = language === 'hi';
        return (fallbackData || []).map((stop: any) => ({
          ...stop,
          name: isHindi && stop.name_hi ? stop.name_hi : stop.name,
          address: isHindi && stop.address_hi ? stop.address_hi : stop.address,
        }));
      }

      // Extract unique bus stops (remove duplicates if any)
      const uniqueStops = new Map();
      data.forEach((item: any) => {
        const stop = item.bus_stops;
        if (!uniqueStops.has(stop.id)) {
          uniqueStops.set(stop.id, stop);
        }
      });

      const busStops = Array.from(uniqueStops.values());
      
      console.log('✅ Loaded', busStops.length, 'bus stops from database in route order');
      console.log('📝 Bus stops received:', busStops);
      console.log(
        '📝 Bus stop names:',
        busStops.map((stop: any) => stop.name),
      );

      const isHindi = language === 'hi';
      return busStops.map((stop: any) => ({
        ...stop,
        name: isHindi && stop.name_hi ? stop.name_hi : stop.name,
        address: isHindi && stop.address_hi ? stop.address_hi : stop.address,
      }));
    } catch (error) {
      console.error('❌ Failed to load bus stops:', error);
      throw error;
    }
  },
};

// Buses API
export const busesApi = {
  async findByStops(
    source: string,
    destination: string,
  ): Promise<BusSearchResult> {
    console.log('🔍 Searching buses from:', source, 'to:', destination);

    if (!supabase || supabaseError) {
      throw new Error('Supabase not properly configured');
    }

    try {
      // Search by both English and Hindi names to support both languages
      const { data, error } = await supabase
        .from('bus_routes')
        .select(
          `
          bus_id,
          buses!inner(id, name, name_hi, is_active),
          bus_stops!inner(name, name_hi)
        `,
        )
        .eq('buses.is_active', true)
        .or(`name.eq.${source},name_hi.eq.${source}`, { foreignTable: 'bus_stops' });

      if (error) {
        console.error('❌ Bus search error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No buses found for route:', source, 'to', destination);
        return { buses: [] }; // Return empty array instead of message
      }

      // Filter to find buses that have both source and destination
      // Group by bus_id and check if bus has both stops
      const busMap = new Map();
      
      // Get all routes for buses that have the source stop
      const busIds = [...new Set(data.map((item: any) => item.bus_id))];
      
      // Now get all routes for these buses to check for destination
      const { data: allRoutes, error: routesError } = await supabase
        .from('bus_routes')
        .select(
          `
          bus_id,
          buses!inner(id, name, name_hi, is_active),
          bus_stops!inner(name, name_hi)
        `,
        )
        .in('bus_id', busIds)
        .eq('buses.is_active', true);

      if (routesError) {
        console.error('❌ Routes search error:', routesError);
        throw routesError;
      }

      // Check which buses have both stops
      allRoutes?.forEach((item: any) => {
        const busId = item.bus_id;
        if (!busMap.has(busId)) {
          busMap.set(busId, {
            bus: item.buses,
            stops: new Set(),
          });
        }
        // Add both English and Hindi names to the set for matching
        busMap.get(busId).stops.add(item.bus_stops.name);
        if (item.bus_stops.name_hi) {
          busMap.get(busId).stops.add(item.bus_stops.name_hi);
        }
      });

      // Filter buses that have both source and destination (in either language)
      const validBuses = Array.from(busMap.values())
        .filter(item => item.stops.has(source) && item.stops.has(destination))
        .map(item => ({
          id: item.bus.id,
          name: item.bus.name,
          name_hi: item.bus.name_hi,
        }));

      console.log('✅ Found', validBuses.length, 'buses for route');
      return { buses: validBuses };
    } catch (error) {
      console.error('❌ Failed to search buses:', error);
      throw error;
    }
  },

  async getById(id: string, language: string = 'en'): Promise<BusRoute> {
    console.log('🔍 Getting bus details for:', id, 'language:', language);

    if (!supabase || supabaseError) {
      throw new Error('Supabase not properly configured');
    }

    try {
      const { data, error } = await supabase
        .from('buses')
        .select(
          `
          id,
          name,
          name_hi,
          description,
          description_hi,
          route_overview,
          route_overview_hi,
          highlights,
          highlights_hi,
          travel_tips,
          travel_tips_hi,
          fare_info,
          bus_routes(
            stop_order,
            arrival_time,
            departure_time,
            bus_stops(
              id, 
              name, 
              name_hi, 
              latitude, 
              longitude, 
              address,
              address_hi,
              description,
              description_hi,
              attractions,
              attractions_hi,
              facilities,
              facilities_hi,
              nearby_landmarks,
              nearby_landmarks_hi
            )
          )
        `,
        )
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('❌ Bus details error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Bus not found');
      }

      console.log('✅ Loaded bus details from database');
      const isHindi = language === 'hi';

      return {
        id: data.id,
        name: isHindi && data.name_hi ? data.name_hi : data.name,
        description:
          isHindi && data.description_hi
            ? data.description_hi
            : data.description,
        route_overview:
          isHindi && data.route_overview_hi
            ? data.route_overview_hi
            : data.route_overview,
        highlights:
          isHindi && data.highlights_hi ? data.highlights_hi : data.highlights,
        travel_tips:
          isHindi && data.travel_tips_hi
            ? data.travel_tips_hi
            : data.travel_tips,
        fare_info: data.fare_info,
        bus_routes:
          data.bus_routes
            ?.sort((a: any, b: any) => a.stop_order - b.stop_order)
            .map((route: any) => ({
              bus_stops: {
                ...route.bus_stops,
                name:
                  isHindi && route.bus_stops.name_hi
                    ? route.bus_stops.name_hi
                    : route.bus_stops.name,
                address:
                  isHindi && route.bus_stops.address_hi
                    ? route.bus_stops.address_hi
                    : route.bus_stops.address,
                description:
                  isHindi && route.bus_stops.description_hi
                    ? route.bus_stops.description_hi
                    : route.bus_stops.description,
                attractions:
                  isHindi && route.bus_stops.attractions_hi
                    ? route.bus_stops.attractions_hi
                    : route.bus_stops.attractions,
                facilities:
                  isHindi && route.bus_stops.facilities_hi
                    ? route.bus_stops.facilities_hi
                    : route.bus_stops.facilities,
                nearby_landmarks:
                  isHindi && route.bus_stops.nearby_landmarks_hi
                    ? route.bus_stops.nearby_landmarks_hi
                    : route.bus_stops.nearby_landmarks,
              },
              stop_order: route.stop_order,
              arrival_time: route.arrival_time,
              departure_time: route.departure_time,
            })) || [],
      };
    } catch (error) {
      console.error('❌ Failed to load bus details:', error);
      throw error;
    }
  },
};
