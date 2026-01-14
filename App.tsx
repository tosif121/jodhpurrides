import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { createTheme } from './themes';
import SplashScreen from './components/SplashScreen';
import MainComponent from './components/MainComponent';
import ResultScreen from './components/ResultScreen';
import AddRouteScreen from './components/AddRouteScreen';
import SimpleDrawer from './components/SimpleDrawer';
import Toast from 'react-native-toast-message';

type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Result: {busRoute: any; source: string; destination: string};
  AddRoute: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainStack: React.FC = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const theme = createTheme(isDark);
  
  return (
    <Stack.Navigator 
      initialRouteName="Splash"
      screenOptions={{ 
        headerShown: false,
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      
      {/* Main screen with drawer */}
      <Stack.Screen name="Main">
        {() => (
          <SimpleDrawer>
            <MainComponent />
          </SimpleDrawer>
        )}
      </Stack.Screen>
      
      {/* Result screen without drawer - with native header */}
      <Stack.Screen 
        name="Result"
        component={ResultScreen}
        options={{
          headerShown: false, // ResultScreen has its own header
        }}
      />
      
      {/* Other screens without drawer - with native header */}
      <Stack.Screen 
        name="AddRoute"
        component={AddRouteScreen}
        options={{
          headerShown: false, // AddRouteScreen has its own header
        }}
      />
    </Stack.Navigator>
  );
};

const AppContent: React.FC = () => {
  const { isDark } = useTheme();
  const theme = createTheme(isDark);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: theme.colors.primary,
            background: theme.colors.background,
            card: theme.colors.card,
            text: theme.colors.text,
            border: theme.colors.border,
            notification: theme.colors.primary,
          },
          fonts: {
            regular: {
              fontFamily: 'System',
              fontWeight: 'normal',
            },
            medium: {
              fontFamily: 'System',
              fontWeight: '500',
            },
            bold: {
              fontFamily: 'System',
              fontWeight: 'bold',
            },
            heavy: {
              fontFamily: 'System',
              fontWeight: '900',
            },
          },
        }}
      >
        <MainStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AppContent />
        <Toast />
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;