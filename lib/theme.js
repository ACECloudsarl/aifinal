// theme.js - Enhanced with modern dark mode
import { extendTheme, theme as baseTheme } from '@chakra-ui/react';

// Modern dark theme color tokens
const modernColors = {
  // Base colors
  white: '#fff',
  black: '#000',
  
  // Gray scale
  gray: {
    50: '#f9f9f9',
    100: '#ececec',
    200: '#e3e3e3',
    300: '#cdcdcd',
    400: '#b4b4b4',
    500: '#9b9b9b',
    600: '#676767',
    700: '#424242',
    750: '#2f2f2f',
    800: '#212121',
    900: '#171717',
    950: '#0d0d0d',
  },
  
  // Brand colors with adjustments for dark mode
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
  
  // Additional semantic colors
  blue: {
    50: '#e6f3ff',
    100: '#cce7ff',
    200: '#99ceff',
    300: '#66b5ff',
    400: '#339dff',
    500: '#0084ff',
    600: '#006acc',
    700: '#004f99',
    800: '#003566',
    900: '#001a33',
  },
  
  red: {
    500: '#f93a37',
    700: '#b91c1c',
  },
  
  // Additional colors
  yellow: {
    900: '#927201',
  },
};

// Semantic color mappings for dark mode
const semanticTokens = {
  colors: {
    // UI Background colors
    "bg-canvas": {
      default: "white",
      _dark: "#171717", // gray.900
    },
    "bg-surface": {
      default: "gray.50",
      _dark: "#212121", // gray.800
    },
    "bg-subtle": {
      default: "gray.100",
      _dark: "#2f2f2f", // gray.750
    },
    "bg-muted": {
      default: "gray.200",
      _dark: "rgba(50, 50, 50, .85)", // message-surface
    },
    
    // Text colors
    "text-primary": {
      default: "gray.900",
      _dark: "#f2f6fa", // content-primary
    },
    "text-secondary": {
      default: "gray.700",
      _dark: "#dbe2e8", // content-secondary
    },
    "text-tertiary": {
      default: "gray.500",
      _dark: "gray.500", 
    },
    "text-placeholder": {
      default: "gray.500",
      _dark: "hsla(0, 0%, 100%, .8)",
    },
    "text-error": {
      default: "red.500",
      _dark: "#f93a37",
    },
    
    // Border colors
    "border-xlight": {
      default: "gray.100",
      _dark: "hsla(0, 0%, 100%, .05)",
    },
    "border-light": {
      default: "gray.200",
      _dark: "hsla(0, 0%, 100%, .1)",
    },
    "border-medium": {
      default: "gray.300",
      _dark: "hsla(0, 0%, 100%, .15)",
    },
    "border-heavy": {
      default: "gray.400",
      _dark: "hsla(0, 0%, 100%, .2)",
    },
    "border-xheavy": {
      default: "gray.500",
      _dark: "hsla(0, 0%, 100%, .25)",
    },
    
    // Surface colors
    "main-surface-primary": {
      default: "white",
      _dark: "gray.800",
    },
    "main-surface-secondary": {
      default: "gray.100",
      _dark: "gray.750",
    },
    "main-surface-tertiary": {
      default: "gray.200",
      _dark: "gray.700",
    },
    
    // Sidebar colors
    "sidebar-surface": {
      default: "white",
      _dark: "#2b2b2b",
    },
    "sidebar-body-primary": {
      default: "gray.800",
      _dark: "#ededed",
    },
    "sidebar-icon": {
      default: "gray.600",
      _dark: "#a4a4a4",
    },
    
    // Interactive states
    "surface-hover": {
      default: "gray.100",
      _dark: "hsla(0, 0%, 100%, .15)",
    },
    "link": {
      default: "blue.500",
      _dark: "#7ab7ff",
    },
    "link-hover": {
      default: "blue.600",
      _dark: "#5e83b3",
    },
  },
};

// Component style overrides
const components = {
  // Text and typography
  Text: {
    baseStyle: {
      fontFamily: "'DM Sans', sans-serif",
    },
  },
  
  Heading: {
    baseStyle: {
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: "600",
    },
  },
  
  // Buttons 
  Button: {
    baseStyle: {
      fontWeight: "500",
      borderRadius: "md",
      _focus: {
        boxShadow: "outline",
      },
    },
    variants: {
      solid: (props) => ({
        bg:
          props.colorScheme === 'brand'
            ? 'brand.500'
            : `${props.colorScheme}.500`,
        color: 'white',
        _hover: {
          bg:
            props.colorScheme === 'brand'
              ? 'brand.600'
              : `${props.colorScheme}.600`,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        },
        transition: 'all 0.2s ease-in-out',
      }),
      outline: (props) => ({
        borderColor:
          props.colorScheme === 'brand'
            ? 'brand.500'
            : `${props.colorScheme}.500`,
        _hover: {
          bg:
            props.colorScheme === 'brand'
              ? 'rgba(88, 47, 224, 0.1)'
              : `${props.colorScheme}.50`,
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease-in-out',
      }),
    },
  },
  
  // Containers
  Container: {
    baseStyle: {
      maxW: "100%",
      px: { base: 4, md: 6, lg: 8 },
    },
  },

  // Cards and surfaces
  Card: {
    baseStyle: {
      container: {
        borderRadius: "lg",
        boxShadow: "sm",
        transition: "all 0.3s ease-in-out",
        _hover: {
          boxShadow: "md",
        },
      },
    },
  },
  
  // Form elements
  Input: {
    baseStyle: {
      field: {
        _dark: {
          bg: 'gray.800',
          borderColor: 'whiteAlpha.300'
        }
      }
    },
    variants: {
      outline: {
        field: {
          _focus: {
            borderColor: "blue.500",
            boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
          },
          _dark: {
            bg: 'gray.800',
            borderColor: 'whiteAlpha.300'
          }
        },
      },
    },
  },
  
  Textarea: {
    baseStyle: {
      _dark: {
        bg: 'gray.800',
        borderColor: 'whiteAlpha.300'
      }
    },
    variants: {
      outline: {
        _focus: {
          borderColor: "blue.500",
          boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
        },
        _dark: {
          bg: 'gray.800',
          borderColor: 'whiteAlpha.300'
        }
      },
    },
  },
  
  // Popover and modal
  Modal: {
    baseStyle: {
      dialog: {
        bg: "bg-surface",
      },
    },
  },
  
  Popover: {
    baseStyle: {
      content: {
        bg: "bg-surface",
        borderColor: "border-light",
        boxShadow: "md"
      },
    },
  },
  
  // Custom component for sidebar
  Sidebar: {
    baseStyle: {
      bg: "sidebar-surface",
      transition: "all 0.3s ease",
    },
  },
};

// Global styles
const styles = {
  global: {
    "html, body": {
      backgroundColor: "bg-canvas",
      color: "text-primary",
      lineHeight: "tall",
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    },
    "*, *::before, *::after": {
      borderColor: "border-light",
    },
    "::selection": {
      backgroundColor: "blue.500",
      color: "white",
    },
    "::-webkit-scrollbar": {
      width: "6px",
      height: "6px",
    },
    "::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
      background: "border-medium",
      borderRadius: "full",
    },
    // Use monospace font for code elements
    "code, kbd, pre": {
      fontFamily: "'JetBrains Mono', monospace",
    },
    // Add RTL support
    "[dir=rtl]": {
      textAlign: "right",
    },
    // Better font smoothing for dark mode
    _dark: {
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    }
  },
};

const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

// Create the theme
const theme = extendTheme({
  colors: modernColors,
  semanticTokens,
  components,
  styles,
  config,
  direction: "ltr", // Default direction, can be dynamically changed
  fonts: {
    heading: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    body: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  shadows: {
    ...baseTheme.shadows,
    // Custom shadows
    outline: "0 0 0 3px rgba(66, 153, 225, 0.6)",
  },
  // Improved spacing scale
  space: {
    ...baseTheme.space,
    "4.5": "1.125rem",
  },
  // Custom breakpoints
  breakpoints: {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
    "2xl": "96em",
  },
});

export default theme;