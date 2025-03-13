// components/layout/Layout.js
import { useState } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ children, currentChat, currentView, chatList = [] }) => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Sidebar component */}
      <Sidebar
        currentChat={currentChat}
        currentView={currentView}
        chatList={chatList}
        isMobileOpen={showMobileNav}
        setIsMobileOpen={setShowMobileNav}
      />
      
      {/* Main content area */}
      <Box 
        ml={{ base: 0, md: 'auto' }} 
        transition="margin 0.3s"
      >
        {/* Header */}
        <Header 
          setMobileMenuOpen={setShowMobileNav}
          currentView={currentView}
        />
        
        {/* Page Content */}
        <Box
          as="main"
          p={{ base: 4, md: 6 }}
          minH="calc(100vh - 72px)"
          maxW="1600px"
          mx="auto"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;