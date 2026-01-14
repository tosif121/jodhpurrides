import React, {useEffect} from 'react';
import {View, Image, StyleSheet, Dimensions, Text} from 'react-native';
import {useTheme} from '../contexts/ThemeContext';
import {createTheme} from '../themes';

interface Props {
  navigation: {
    replace: (screen: string) => void;
  };
}

const SplashScreen = ({navigation}: Props) => {
  const {isDark} = useTheme();
  const theme = createTheme(isDark);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Main');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <Image
        source={require('../images/splash_screen.jpg')}
        style={styles.image}
      />
      <View style={[styles.overlay, {backgroundColor: 'rgba(0, 0, 0, 0.4)'}]}>
        <Text style={[styles.text, {color: '#FFFFFF'}]}>Jodhpur Bus Rides</Text>
        <Text style={[styles.subtitle, {color: '#FFFFFF'}]}>Your Journey Starts Here</Text>
      </View>
    </View>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});

export default SplashScreen;