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
  Portal,
  VStack,
  Container,
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
  FiChevronDown,
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
  
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e) => {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);
  
  // Theme values
  const bgColor = useColorModeValue('white', 'gray.1000');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const searchBgColor = useColorModeValue('gray.50', 'gray.800');
  const searchHoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const searchFocusBgColor = useColorModeValue('white', 'gray.750');
  const searchPlaceholderColor = useColorModeValue('gray.400', 'gray.500');
  
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
      zIndex={10}
      backdropFilter="blur(10px)"
      w="full"
    >
      <Container maxW="1440px" px={{ base: 4, md: 6 }} py={3}>
        <Flex align="center" justify="space-between">
          {/* Left section: Mobile menu button and page title */}
          <HStack spacing={4}>
            <IconButton
              aria-label="Open menu"
              icon={<FiMenu size={18} />}
              variant="ghost"
              display={{ base: 'flex', md: 'none' }}
              onClick={onMobileMenuOpen}
              size="sm"
            />
            
            {(!showMobileSearch || !isMobile) && (
              <HStack spacing={2}>
                {getPageIcon() && (
                  <Flex
                    align="center"
                    justify="center"
                    bg="brand.50"
                    color="brand.500"
                    boxSize="36px" 
                    borderRadius="lg"
                    _dark={{
                      bg: 'rgba(94, 46, 255, 0.2)',
                      color: 'brand.300',
                    }}
                  >
                    <Box as={getPageIcon()} size={18} />
                  </Flex>
                )}
                
                <Box>
                  <Heading
                    size="sm"
                    fontWeight="600"
                    letterSpacing="-0.01em"
                  >
                    {getPageTitle()}
                  </Heading>
                  
                  {currentView === 'explore' && (
                    <HStack spacing={1} mt={0.5}>
                      <Badge colorScheme="purple" variant="subtle" fontSize="2xs">New</Badge>
                      <Text fontSize="xs" color="gray.500" fontWeight="normal">
                        Discover our latest AI models
                      </Text>
                    </HStack>
                  )}
                </Box>
              </HStack>
            )}
          </HStack>
          
          {/* Center/Right section: Search, actions and user */}
          <HStack spacing={{ base: 2, md: 4 }}>
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
                <InputGroup size="sm" w={{ base: 'full', md: '280px', lg: '320px' }}>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="var(--chakra-colors-gray-400)" size={14} />
                  </InputLeftElement>
                  
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    bg={searchBgColor}
                    _hover={{ bg: searchHoverBgColor }}
                    _focus={{ 
                      bg: searchFocusBgColor,
                      borderColor: 'brand.400',
                    }}
                    borderRadius="md"
                    fontSize="sm"
                    _placeholder={{ color: searchPlaceholderColor }}
                  />
                  
                  <InputRightElement>
                    {searchQuery ? (
                      <IconButton
                        icon={<FiX size={14} />}
                        variant="ghost"
                        size="xs"
                        isRound
                        aria-label="Clear search"
                        onClick={clearSearch}
                      />
                    ) : (
                      <Flex
                        align="center"
                        justify="center"
                        bg={useColorModeValue('gray.200', 'gray.700')}
                        color={useColorModeValue('gray.500', 'gray.400')}
                        px={1.5}
                        borderRadius="md"
                        fontSize="xs"
                        h="18px"
                        mr={2}
                      >
                        <Box as={FiCommand} mr={0.5} size={10} />
                        <Text fontSize="10px" fontWeight="medium">K</Text>
                      </Flex>
                    )}
                  </InputRightElement>
                </InputGroup>
                
                {showMobileSearch && isMobile && (
                  <IconButton
                    icon={<FiX size={16} />}
                    variant="ghost"
                    position="absolute"
                    right={2}
                    top="50%"
                    transform="translateY(-50%)"
                    aria-label="Close search"
                    onClick={toggleMobileSearch}
                    size="sm"
                  />
                )}
              </Box>
            )}
            
            {/* Mobile search toggle button */}
            {isMobile && !showMobileSearch && (
              <IconButton
                aria-label="Search"
                icon={<FiSearch size={16} />}
                variant="ghost"
                onClick={toggleMobileSearch}
                size="sm"
              />
            )}
            
            {/* New chat button - hidden on mobile and when search is open */}
            {(!isMobile && !showMobileSearch) && (
              <Button
                leftIcon={<FiPlus size={14} />}
                colorScheme="brand"
                size="sm"
                fontWeight="medium"
                display={{ base: 'none', sm: 'flex' }}
                boxShadow="sm"
              >
                New Chat
              </Button>
            )}
            
            {/* Theme toggle */}
            <Tooltip label={colorMode === 'light' ? 'Dark mode' : 'Light mode'} fontSize="xs">
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
                variant="ghost"
                onClick={toggleColorMode}
                color={colorMode === 'light' ? 'gray.700' : 'yellow.300'}
                size="sm"
              />
            </Tooltip>
            
            {/* Notifications */}
            <Tooltip label="Notifications" fontSize="xs">
              <IconButton
                aria-label="Notifications"
                icon={<FiBell size={16} />}
                variant="ghost"
                position="relative"
                size="sm"
              >
                <Badge
                  position="absolute"
                  top="2px"
                  right="2px"
                  colorScheme="red"
                  variant="solid"
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
                size="sm"
                px={2}
                py={1}
                borderRadius="md"
                _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
              >
                <HStack spacing={2}>
                  <Avatar
                    size="xs"
                    name="User Name"
                    src="/images/avatar.jpg"
                    borderWidth={1.5}
                    borderColor={bgColor}
                  />
                  <Text fontSize="sm" fontWeight="medium" display={{ base: 'none', md: 'block' }}>
                    User Name
                  </Text>
                  <Box as={FiChevronDown} size={14} color="gray.500" />
                </HStack>
              </MenuButton>
              <MenuList zIndex={20} py={2} minW="200px">
                <VStack align="start" px={3} pb={2} mb={2} borderBottom="1px solid" borderColor={borderColor}>
                  <Text fontWeight="medium">User Name</Text>
                  <Text fontSize="sm" color="gray.500">user@example.com</Text>
                </VStack>
                <MenuItem icon={<FiUser size={14} />} fontSize="sm">Profile</MenuItem>
                <MenuItem icon={<FiSettings size={14} />} fontSize="sm">Settings</MenuItem>
                <MenuDivider />
                <MenuItem icon={<FiLogOut size={14} />} color="red.500" fontSize="sm">Logout</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Container>
      
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
              borderRadius="xl" 
              boxShadow="xl" 
              w="full" 
              maxW="560px"
              mt={20}
              overflow="hidden"
              borderWidth="1px"
              borderColor={borderColor}
              onClick={(e) => e.stopPropagation()}
            >
              <Box as="form" onSubmit={handleSearchSubmit} p={4}>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="var(--chakra-colors-gray-400)" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search for chats, bots, or settings..."
                    autoFocus
                    value={searchQuery}
                    onChange={handleSearchChange}
                    borderRadius="md"
                    variant="filled"
                    bg={searchBgColor}
                    _hover={{ bg: searchHoverBgColor }}
                    _focus={{ bg: searchFocusBgColor }}
                    fontSize="sm"
                  />
                  <InputRightElement>
                    <Box mr={1}>
                      <Kbd fontSize="xs" bg="gray.100" color="gray.500" borderColor="gray.200" px={1.5} py={0.5}>
                        Esc
                      </Kbd>
                    </Box>
                  </InputRightElement>
                </InputGroup>
              </Box>
              
              {searchQuery && (
                <VStack align="stretch" p={2} spacing={1} maxH="320px" overflowY="auto">
                  <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500" px={2} py={1}>
                    Quick Actions
                  </Text>
                  
                  <Button variant="ghost" justifyContent="flex-start" leftIcon={<FiPlus size={14} />} size="sm" borderRadius="md">
                    Create a new chat
                  </Button>
                  
                  <Button variant="ghost" justifyContent="flex-start" leftIcon={<FiSearch size={14} />} size="sm" borderRadius="md">
                    Explore available bots
                  </Button>
                  
                  <Button variant="ghost" justifyContent="flex-start" leftIcon={<FiSettings size={14} />} size="sm" borderRadius="md">
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