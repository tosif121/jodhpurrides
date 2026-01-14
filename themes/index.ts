import { TextStyle, ViewStyle } from 'react-native';
import { getTheme, ThemeColors } from './colors';

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  styles: {
    container: ViewStyle;
    card: ViewStyle;
    button: {
      primary: ViewStyle;
      secondary: ViewStyle;
      text: {
        primary: TextStyle;
        secondary: TextStyle;
      };
    };
    input: ViewStyle & TextStyle;
    text: {
      primary: TextStyle;
      secondary: TextStyle;
      heading: TextStyle;
    };
  };
}

export const createTheme = (isDark: boolean = false): Theme => {
  const colors = getTheme(isDark);
  
  return {
    colors,
    isDark,
    
    // Common styles
    styles: {
      container: {
        flex: 1,
        backgroundColor: colors.background,
      },
      
      card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: colors.shadow,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      
      button: {
        primary: {
          backgroundColor: colors.primary,
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        
        secondary: {
          backgroundColor: colors.backgroundSecondary,
          borderWidth: 1,
          borderColor: colors.border,
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
        },
        
        text: {
          primary: {
            color: colors.textInverse,
            fontSize: 16,
            fontWeight: '500',
          },
          
          secondary: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
          },
        },
      },
      
      input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        color: colors.text,
        fontSize: 16,
      },
      
      text: {
        primary: {
          color: colors.text,
          fontSize: 16,
        },
        
        secondary: {
          color: colors.textSecondary,
          fontSize: 14,
        },
        
        heading: {
          color: colors.text,
          fontSize: 24,
          fontWeight: '600',
        },
      },
    },
  };
};

export * from './colors';