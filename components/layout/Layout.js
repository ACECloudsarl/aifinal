// components/layout/Layout.js
import { useState } from 'react';
import { 
  Box, 
  Flex, 
  useColorModeValue 
} from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ 
  children, 
  currentChat, 
  currentView, 
  chatList = [] 
}) => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Flex 
      minHeight="100vh" 
      bg={bgColor}
    >
      {/* Sidebar component */}
      <Sidebar
        currentChat={currentChat}
        currentView={currentView}
        chatList={chatList}
        isMobileOpen={showMobileNav}
        setIsMobileOpen={setShowMobileNav}
      />
      
      {/* Main content area */}
      <Flex 
        flexDirection="column" 
        flex={1} 
        ml={{ base: 0, md: '280px' }}
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
          flex={1}
          maxW="1600px"
          mx="auto"
          width="full"
          overflow="hidden"
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
};

export default Layout;