// lib/theme.js
import { extendTheme } from '@mui/joy/styles';

// All the color options
export const themeColors = {
  purple: {
    primary: '#bc71dd',
    secondary: '#9656b5',
    accent: '#e2baff',
    background: '#fcf8ff',
    darkBackground: '#2a1e35',
  },
  teal: {
    primary: '#3dd2c0',
    secondary: '#25a699',
    accent: '#b5f1ea',
    background: '#f2fffd',
    darkBackground: '#1a3d39',
  },
  amber: {
    primary: '#ffb74d',
    secondary: '#e69c35',
    accent: '#ffe0b2',
    background: '#fffaf2',
    darkBackground: '#3d2e19',
  },
  rose: {
    primary: '#ff6b95',
    secondary: '#e64f77',
    accent: '#ffd1dd',
    background: '#fff5f8',
    darkBackground: '#3d1d27',
  },
  blue: {
    primary: '#5b9aff',
    secondary: '#4778d9',
    accent: '#c7dfff',
    background: '#f5f9ff',
    darkBackground: '#1e2a3d',
  },
};

/**
 * @param {string} colorScheme - must be one of "purple", "teal", "amber", "rose", "blue"
 * @param {string} mode - either "light" or "dark"
 */
export const createTheme = (colorScheme = 'purple', mode = 'light') => {
  // In case an invalid colorScheme is passed, default to 'purple'
  const colors = themeColors[colorScheme] || themeColors.purple;

  console.log('createTheme called with:', { colorScheme, mode });
  console.log('Using colors:', colors);

  return extendTheme({
    colorSchemes: {
      light: {
        palette: {
          primary: {
            main: colors.primary,
            solidBg: colors.primary,
            solidHoverBg: colors.secondary,
            plainColor: colors.primary,
            plainHoverBg: colors.accent,
            outlinedBorder: colors.primary,
          },
          background: {
            body: colors.background,
            surface: '#ffffff',
          },
        },
      },
      dark: {
        palette: {
          primary: {
            main: colors.primary,
            solidBg: colors.primary,
            solidHoverBg: colors.secondary,
            plainColor: colors.primary,
            // example fallback color for 'plainHoverBg' in dark mode
            plainHoverBg: 'rgba(188, 113, 221, 0.2)',
            outlinedBorder: colors.primary,
          },
          background: {
            body: colors.darkBackground,
            surface: '#121212',
          },
          text: {
            primary: '#f5f5f5',
            secondary: '#c7c7c7',
          },
        },
      },
    },
    fontFamily: {
      body: '"IBM Plex Sans", "Noto Sans Arabic", sans-serif',
    },
    components: {
      JoyButton: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
          },
        },
      },
      JoyCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow:
              mode === 'light'
                ? '0 4px 20px rgba(0, 0, 0, 0.08)'
                : '0 4px 20px rgba(0, 0, 0, 0.4)',
          },
        },
      },
    },
  });
};
