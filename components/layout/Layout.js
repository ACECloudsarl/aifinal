// components/layout/Layout.js - Enhanced for RTL and mobile
import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  useColorMode,
  IconButton,
  Tooltip,
  Portal
} from '@chakra-ui/react';
import { FiMoon, FiSun } from 'react-icons/fi';
import Header from './Header';
import Sidebar from './Sidebar';
import Head from 'next/head';

const Layout = ({ 
  children, 
  currentChat, 
  currentView, 
  chatList = [],
  title,
  hideNav = false,
  dir = 'ltr' // Default direction is LTR
}) => {
  // Sidebar collapse state and mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  
  // Background colors - using semantic tokens
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const contentBg = useColorModeValue('white', 'gray.800');
  
  // Responsive values
  const sidebarWidth = isCollapsed ? "72px" : "280px";
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Detect RTL content in the page
  const [isRTL, setIsRTL] = useState(dir === 'rtl');
  
  // Load sidebar collapse state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
    
    // Set collapsed on small screens automatically
    if (window.innerWidth < 1024 && window.innerWidth >= 768) {
      setIsCollapsed(true);
    }
    
    // Check for RTL text in the page
    const detectRTL = () => {
      const rtlChars = /[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]/;
      // Look for elements with dir="auto" and check if they contain RTL text
      const rtlElements = document.querySelectorAll('[dir="auto"]');
      let hasRTL = false;
      
      rtlElements.forEach(el => {
        if (rtlChars.test(el.textContent)) {
          hasRTL = true;
        }
      });
      
      if (hasRTL !== isRTL) {
        setIsRTL(hasRTL);
      }
    };
    
    // Run detection initially and on content changes
    detectRTL();
    
    // Set up observer to detect RTL content changes
    const observer = new MutationObserver(detectRTL);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);
  
  // Save collapse state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);
  
  // Update document direction based on RTL detection
  useEffect(() => {
    if (document) {
      document.dir = isRTL ? 'rtl' : 'ltr';
    }
  }, [isRTL]);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <>
      <Head>
        <html lang={isRTL ? 'ar' : 'en'} dir={isRTL ? 'rtl' : 'ltr'} />
      </Head>
      <Flex 
        minHeight="100vh" 
        bg={bgColor}
        direction="column"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Sidebar component - hide if requested */}
        {!hideNav && (
          <Sidebar
            currentChat={currentChat}
            currentView={currentView}
            chatList={chatList}
            isOpen={isOpen}
            onClose={onClose}
            isCollapsed={isCollapsed}
            toggleSidebar={toggleSidebar}
            isRTL={isRTL}
          />
        )}
        
        {/* Main content area */}
        <Flex 
          direction="column" 
          flex={1} 
          ml={hideNav ? 0 : { base: 0, md: isRTL ? 0 : sidebarWidth }}
          mr={hideNav ? 0 : { base: 0, md: isRTL ? sidebarWidth : 0 }}
          transition="margin 0.3s ease"
        >
          {/* Header */}
          {!hideNav && (
            <Header 
              onMobileMenuOpen={onOpen}
              currentView={currentView}
              title={title}
              isCollapsed={isCollapsed}
              isRTL={isRTL}
            />
          )}
          
          {/* Page Content */}
          <Box
            as="main"
            p={{ base: 3, md: 5 }}
            flex="1"
            overflowX="hidden"
            overflowY="auto"
            bg={contentBg}
            borderRadius={{ base: 0, md: "lg" }}
            boxShadow={{ base: "none", md: "sm" }}
            m={{ base: 0, md: 4 }}
            className="main-content"
          >
            {children}
          </Box>
        </Flex>
        
        {/* Color mode toggle - fixed position */}
        <Box 
          position="fixed" 
          bottom={4} 
          right={isRTL ? "auto" : 4}
          left={isRTL ? 4 : "auto"}
          zIndex={10}
        >
          <Tooltip 
            label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            placement={isRTL ? 'right' : 'left'}
          >
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              onClick={toggleColorMode}
              borderRadius="full"
              boxShadow="md"
              colorScheme={colorMode === 'light' ? 'purple' : 'yellow'}
              size="md"
            />
          </Tooltip>
        </Box>
      </Flex>
    </>
  );
};

export default Layout;