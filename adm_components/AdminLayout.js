// components/admin/AdminLayout.js
import React from 'react';
import {
  Box,
  Text,
  Flex,
  VStack,
  List,
  ListItem,
  Divider,
  useColorModeValue,
  IconButton,
  Heading,
  Button,
  Link,
  HStack,
  useBreakpointValue
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { 
  Settings, 
  Users, 
  Bot, 
  Database, 
  Home, 
  Shield, 
  Volume2,
  Menu as MenuIcon
} from 'lucide-react';
import Layout from '@/components/layout/Layout';

const AdminLayout = ({ children, title }) => {
  const router = useRouter();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  // Colors
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const selectedBg = useColorModeValue("purple.50", "purple.900");
  const selectedColor = useColorModeValue("purple.500", "purple.200");
  
  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Dashboard', 
      path: '/admin' 
    },
    { 
      icon: <Bot size={20} />, 
      label: 'Bots Management', 
      path: '/admin/bots' 
    },
    { 
      icon: <Volume2 size={20} />, 
      label: 'Voices', 
      path: '/admin/voices' 
    },
    { 
      icon: <Users size={20} />, 
      label: 'Users', 
      path: '/admin/users' 
    },
    { 
      icon: <Database size={20} />, 
      label: 'Models', 
      path: '/admin/models' 
    },
    { 
      icon: <Settings size={20} />, 
      label: 'Settings', 
      path: '/admin/settings' 
    },
  ];
  
  return (
    <Layout>
      <Flex minHeight="calc(100vh - 64px)" bg={useColorModeValue("gray.50", "gray.900")}>
        {/* Mobile menu button */}
        {isMobile && (
          <IconButton
            aria-label="Open menu"
            icon={<MenuIcon />}
            position="fixed"
            top="80px"
            left="20px"
            zIndex="10"
            colorScheme="purple"
            onClick={() => setMenuOpen(!menuOpen)}
            display={{ base: 'flex', md: 'none' }}
          />
        )}
        
        {/* Admin Sidebar */}
        <Box
          width="250px"
          borderRight="1px solid"
          borderColor={borderColor}
          bg={bg}
          display={{ base: menuOpen ? 'block' : 'none', md: 'block' }}
          position={{ base: 'fixed', md: 'relative' }}
          height="full"
          zIndex="5"
          boxShadow={{ base: "lg", md: "none" }}
        >
          <Box p={4}>
            <HStack spacing={2}>
              <Shield size={24} color={useColorModeValue("purple.500", "purple.200")} />
              <Heading size="md" fontWeight="bold">
                Admin Panel
              </Heading>
            </HStack>
          </Box>
          
          <Divider borderColor={borderColor} />
          
          <List spacing={1} px={2} py={2}>
            {menuItems.map((item) => {
              const isActive = router.pathname === item.path || 
                            (item.path !== '/admin' && router.pathname.startsWith(item.path));
              
              return (
                <ListItem key={item.path}>
                  <NextLink href={item.path} passHref>
                    <Button
                      as="a"
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={item.icon}
                      borderRadius="md"
                      py={3}
                      px={4}
                      w="full"
                      bg={isActive ? selectedBg : "transparent"}
                      color={isActive ? selectedColor : "inherit"}
                      _hover={{
                        bg: useColorModeValue("gray.100", "gray.700")
                      }}
                      onClick={() => isMobile && setMenuOpen(false)}
                    >
                      {item.label}
                    </Button>
                  </NextLink>
                </ListItem>
              );
            })}
          </List>
        </Box>
        
        {/* Content Area */}
        <Box flex={1} p={5} ml={{ base: 0, md: 0 }}>
          <Heading as="h1" size="lg" mb={5} ml={{ base: 10, md: 0 }}>
            {title}
          </Heading>
          
          <Box
            bg={bg}
            borderRadius="lg"
            boxShadow="sm"
            p={5}
            borderWidth="1px"
            borderColor={borderColor}
          >
            {children}
          </Box>
        </Box>
      </Flex>
    </Layout>
  );
};

export default AdminLayout;