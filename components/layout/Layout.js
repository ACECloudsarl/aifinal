// components/layout/Layout.js
import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  useColorModeValue,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = ({ 
  children, 
  currentChat, 
  currentView, 
  chatList = [],
  title
}) => {
  // Sidebar collapse state and mobile drawer
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Background colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const contentBg = useColorModeValue('white', 'gray.800');
  
  // Responsive values
  const sidebarWidth = isCollapsed ? "72px" : "280px";
  const isMobile = useBreakpointValue({ base: true, md: false });
  
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
  }, []);
  
  // Save collapse state to localStorage
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <Flex 
      minHeight="100vh" 
      bg={bgColor}
      direction="column"
    >
      {/* Sidebar component */}
      <Sidebar
        currentChat={currentChat}
        currentView={currentView}
        chatList={chatList}
        isOpen={isOpen}
        onClose={onClose}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
      />
      
      {/* Main content area */}
      <Flex 
        direction="column" 
        flex={1} 
        ml={{ base: 0, md: sidebarWidth }}
        transition="margin 0.3s ease"
      >
        {/* Header */}
        <Header 
          onMobileMenuOpen={onOpen}
          currentView={currentView}
          title={title}
          isCollapsed={isCollapsed}
        />
        
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
    </Flex>
  );
};

export default Layout;