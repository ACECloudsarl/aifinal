import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import theme from '@/lib/theme';

export function ThemeProvider({ children }) {
  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </>
  );
}