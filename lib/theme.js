// theme.js
import { extendTheme } from '@chakra-ui/react';

// Custom color palette
const colors = {
  brand: {
    50: '#f0e7ff',
    100: '#d1bfff',
    200: '#b197fc',
    300: '#916ffa',
    400: '#7147f7',
    500: '#582fe0',
    600: '#4424af',
    700: '#31197f',
    800: '#1d0f4f',
    900: '#0a0521',
  },
  // Add other custom colors as needed
};

// Component style overrides
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
      _focus: {
        boxShadow: 'outline',
      },
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : `${props.colorScheme}.500`,
        color: 'white',
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : `${props.colorScheme}.600`,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        },
        transition: 'all 0.2s ease-in-out',
      }),
      outline: (props) => ({
        borderColor: props.colorScheme === 'brand' ? 'brand.500' : `${props.colorScheme}.500`,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.50' : `${props.colorScheme}.50`,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease-in-out',
      }),
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'sm',
        transition: 'all 0.3s ease-in-out',
        _hover: {
          boxShadow: 'md',
        },
      },
    },
  },
  Sidebar: {
    baseStyle: {
      bg: 'white',
      _dark: {
        bg: 'gray.800',
      },
      transition: 'all 0.3s ease',
    },
  },
};

// Theme direction for RTL support
const direction = 'ltr';

// Create the extended theme
const theme = extendTheme({
  colors,
  components,
  direction,
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  fonts: {
    heading: '"Inter", sans-serif',
    body: '"Inter", sans-serif',
  },
  styles: {
    global: (props) => ({
      'html, body': {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
});

export default theme;