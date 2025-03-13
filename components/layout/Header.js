// components/layout/Header.js
import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Button,
  Heading,
  Badge,
  useColorMode,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useBreakpointValue,
  HStack,
  Text,
  Tooltip,
  Kbd,
  useDisclosure,
  Collapse,
  useOutsideClick,
  Portal,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import {
  FiMenu,
  FiSearch,
  FiMessageSquare,
  FiMoon,
  FiSun,
  FiGrid,
  FiBell,
  FiPlus,
  FiHome,
  FiX,
  FiSettings,
  FiUser,
  FiLogOut,
  FiImage,
  FiCommand,
} from 'react-icons/fi';
import { useRouter } from 'next/router';

const Header = ({ onMobileMenuOpen, currentView, title }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const router = useRouter();
  const searchRef = useRef();
  
  // Command palette (search) state
  const { isOpen, onToggle, onClose } = useDisclosure();
  useOutsideClick({
    ref: searchRef,
    handler: onClose,
  });
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Page titles based on current view
  const getPageTitle = () => {
    const titles = {
      'home': 'Dashboard',
      'chat': 'Chat',
      'explore': 'Explore Bots',
      'create-image': 'Create Images',
      'gallery': 'Image Gallery',
      'settings': 'Settings'
    };
    
    return titles[currentView] || title || 'Dashboard';
  };
  
  // Page icons based on current view
  const getPageIcon = () => {
    const viewIcons = {
      'chat': FiMessageSquare,
      'explore': FiSearch,
      'create-image': FiImage,
      'gallery': FiGrid,
      'home': FiHome,
      'settings': FiSettings
    };
    
    return viewIcons[currentView] || FiHome;
  };
  
  // Toggle search display on mobile
  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  // Handle search query
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      if (isMobile) {
        setShowMobileSearch(false);
      }
      onClose();
    }
  };
  
  // Open search with keyboard shortcut
  const handleKeyDown = (e) => {
    // Handle Command/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      onToggle();
    }
    // Close on Escape
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  };
  
  // Add keyboard listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  
  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      bg={bgColor}
      boxShadow="sm"
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 4, md: 6 }}
      py={3}
      zIndex={10}
      backdropFilter="blur(10px)"
    >
      <Flex align="center" justify="space-between">
        {/* Left section: Mobile menu button and page title */}
        <HStack spacing={3}>
          <IconButton
            aria-label="Open menu"
            icon={<FiMenu />}
            variant="ghost"
            display={{ base: 'flex', md: 'none' }}
            onClick={onMobileMenuOpen}
          />
          
          {(!showMobileSearch || !isMobile) && (
            <HStack>
              <Heading
                size="md"
                display="flex"
                alignItems="center"
                gap={2}
              >
                {getPageIcon() && <Box as={getPageIcon()} />}
                {getPageTitle()}
              </Heading>
              
              {currentView === 'explore' && (
                <Badge colorScheme="purple" variant="subtle">New</Badge>
              )}
            </HStack>
          )}
        </HStack>
        
        {/* Center/Right section: Search, actions and user */}
        <HStack spacing={3}>
          {/* Search - Shown on desktop or when toggled on mobile */}
          {(!isMobile || showMobileSearch) && (
            <Box
              as="form"
              onSubmit={handleSearchSubmit}
              w={showMobileSearch && isMobile ? 'full' : 'auto'}
              position={showMobileSearch && isMobile ? 'absolute' : 'static'}
              left={showMobileSearch && isMobile ? 0 : 'auto'}
              right={showMobileSearch && isMobile ? 0 : 'auto'}
              px={showMobileSearch && isMobile ? 4 : 0}
              py={showMobileSearch && isMobile ? 2 : 0}
              bg={bgColor}
              zIndex={2}
            >
              <InputGroup size="md" w={{ base: 'full', md: '300px' }}>
                <InputLeftElement pointerEvents="none">
                  <FiSearch color="gray.300" />
                </InputLeftElement>
                
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  variant="filled"
                  bg={useColorModeValue('gray.100', 'gray.700')}
                  _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
                  _focus={{ 
                    bg: useColorModeValue('white', 'gray.800'),
                    borderColor: 'brand.500',
                  }}
                  borderRadius="full"
                />
                
                <InputRightElement>
                  {searchQuery ? (
                    <IconButton
                      icon={<FiX />}
                      variant="ghost"
                      size="sm"
                      isRound
                      aria-label="Clear search"
                      onClick={clearSearch}
                    />
                  ) : (
                    <Flex
                      align="center"
                      justify="center"
                      bg={useColorModeValue('gray.200', 'gray.600')}
                      color={useColorModeValue('gray.500', 'gray.400')}
                      px={2}
                      borderRadius="md"
                      fontSize="xs"
                      h="20px"
                      mr={2}
                    >
                      <Box as={FiCommand} mr={1} />
                      K
                    </Flex>
                  )}
                </InputRightElement>
              </InputGroup>
              
              {showMobileSearch && isMobile && (
                <IconButton
                  icon={<FiX />}
                  variant="ghost"
                  position="absolute"
                  right={2}
                  top="50%"
                  transform="translateY(-50%)"
                  aria-label="Close search"
                  onClick={toggleMobileSearch}
                />
              )}
            </Box>
          )}
          
          {/* Mobile search toggle button */}
          {isMobile && !showMobileSearch && (
            <IconButton
              aria-label="Search"
              icon={<FiSearch />}
              variant="ghost"
              onClick={toggleMobileSearch}
            />
          )}
          
          {/* New chat button - hidden on mobile and when search is open */}
          {(!isMobile && !showMobileSearch) && (
            <Button
              leftIcon={<FiPlus />}
              colorScheme="brand"
              variant="outline"
              size="sm"
              display={{ base: 'none', sm: 'flex' }}
            >
              New Chat
            </Button>
          )}
          
          {/* New image button - only on image pages */}
          {['gallery', 'create-image'].includes(currentView) && !isMobile && !showMobileSearch && (
            <Button
              leftIcon={<FiImage />}
              colorScheme="purple"
              variant="outline"
              size="sm"
              display={{ base: 'none', sm: 'flex' }}
            >
              New Image
            </Button>
          )}
          
          {/* Theme toggle */}
          <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'}>
            <IconButton
              aria-label="Toggle color mode"
              icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
              variant="ghost"
              onClick={toggleColorMode}
              color={colorMode === 'light' ? 'gray.700' : 'yellow.300'}
            />
          </Tooltip>
          
          {/* Notifications */}
          <Tooltip label="Notifications">
            <IconButton
              aria-label="Notifications"
              icon={<FiBell />}
              variant="ghost"
              position="relative"
            >
              <Badge
                position="absolute"
                top="-2px"
                right="-2px"
                colorScheme="red"
                borderRadius="full"
                boxSize="6px"
              />
            </IconButton>
          </Tooltip>
          
          {/* User menu */}
          <Menu placement="bottom-end">
            <MenuButton
              as={Button}
              variant="ghost"
              p={0}
              ml={0.5}
            >
              <Avatar
                size="sm"
                name="User Name"
                src="/images/avatar.jpg"
                borderWidth={2}
                borderColor={bgColor}
              />
            </MenuButton>
            <MenuList zIndex={20}>
              <MenuItem icon={<FiUser fontSize="1.2em" />}>Profile</MenuItem>
              <MenuItem icon={<FiSettings fontSize="1.2em" />}>Settings</MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut fontSize="1.2em" />} color="red.500">Logout</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      
      {/* Command palette / Global search */}
      <Portal>
        {isOpen && (
          <Flex 
            position="fixed" 
            top="0" 
            left="0" 
            right="0" 
            bottom="0" 
            bg="blackAlpha.600" 
            zIndex={1000}
            align="flex-start"
            justify="center"
            p={4}
            onClick={onClose}
          >
            <Box 
              ref={searchRef}
              bg={bgColor} 
              borderRadius="lg" 
              boxShadow="lg" 
              w="full" 
              maxW="600px"
              mt={20}
              onClick={(e) => e.stopPropagation()}
            >
              <Box as="form" onSubmit={handleSearchSubmit} p={4}>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.500" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search for chats, bots, or settings..."
                    autoFocus
                    value={searchQuery}
                    onChange={handleSearchChange}
                    borderRadius="md"
                    variant="filled"
                  />
                  <InputRightElement>
                    <Box mr={1}>
                      <Kbd>Esc</Kbd>
                    </Box>
                  </InputRightElement>
                </InputGroup>
              </Box>
              
              {searchQuery && (
                <VStack align="stretch" p={4} pt={0} spacing={2} maxH="300px" overflowY="auto">
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" my={2}>
                    Quick Actions
                  </Text>
                  
                  <Button variant="ghost" justifyContent="flex-start" leftIcon={<FiPlus />}>
                    Create a new chat
                  </Button>
                  
                  <Button variant="ghost" justifyContent="flex-start" leftIcon={<FiSearch />}>
                    Explore available bots
                  </Button>
                  
                  <Button variant="ghost" justifyContent="flex-start" leftIcon={<FiSettings />}>
                    Open settings
                  </Button>
                </VStack>
              )}
            </Box>
          </Flex>
        )}
      </Portal>
    </Box>
  );
};

export default Header;