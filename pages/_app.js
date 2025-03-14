// pages/_app.js
import { useRouter } from 'next/router';
import theme from '@/lib/theme';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { CacheProvider } from '@emotion/react';
import rtlPlugin from 'stylis-plugin-rtl';
import createCache from '@emotion/cache';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '../components/theme-provider';


// Create rtl cache
const createRtlCache = () => {
  return createCache({
    key: 'muirtl',
    stylisPlugins: [rtlPlugin],
  });
};

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  
  // Determine if the current route should use RTL
  const isRtl = router.locale === 'ar';
  
  // Create appropriate cache
  const cache = isRtl ? createRtlCache() : createCache({ key: 'muiltr' });
  
  // Create direction-aware theme
  const directionTheme = {
    ...theme,
    direction: isRtl ? 'rtl' : 'ltr',
  };

  return (
    <SessionProvider session={session}>
<ThemeProvider>
    <CacheProvider value={cache}>
      <ChakraProvider theme={directionTheme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <div dir={isRtl ? 'rtl' : 'ltr'}>

          <Component {...pageProps} />

        </div>
      </ChakraProvider>
    </CacheProvider>
    </ThemeProvider>
    </SessionProvider>

  );
}

export default MyApp;
