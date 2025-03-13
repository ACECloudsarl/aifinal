// components/layout/Sidebar.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  Text,
  Stack,
  Button,
  Icon,
  Avatar,
  Divider,
  Tooltip,
  Badge,
  useColorMode,
  useColorModeValue,
  Progress,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  VStack,
  HStack,
  Collapse,
  Heading,
} from '@chakra-ui/react';
import {
  FiHome,
  FiMessageSquare,
  FiSearch,
  FiGrid,
  FiImage,
  FiPlus,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiMenu,
  FiStar,
  FiBell,
  FiZap,
  FiClock,
} from 'react-icons/fi';

const Sidebar = ({ currentView, currentChat, chatList = [] }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Sidebar collapse state (for desktop)
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    // Load collapse state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
    
    // Handle collapse state on mobile
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Save collapse state when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const primaryGradient = useColorModeValue(
    'linear(to-r, brand.500, purple.500)',
    'linear(to-r, brand.400, purple.400)'
  );
  
  // Navigation items
  const navItems = [
    { icon: FiHome, title: 'Home', path: '/', view: 'home' },
    { icon: FiMessageSquare, title: 'Chats', path: '/chat', view: 'chat' },
    { icon: FiImage, title: 'Create Images', path: '/create-image', view: 'create-image' },
    { icon: FiGrid, title: 'Gallery', path: '/gallery', view: 'gallery' },
    { icon: FiSearch, title: 'Explore Bots', path: '/explore', view: 'explore' },
  ];

  // Format date for chat items
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(router.locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  // Render the sidebar content (shared between desktop and mobile)
  const SidebarContent = ({ isDrawer = false }) => (
    <Flex direction="column" h="100%" py={3}>
      {/* Sidebar Header */}
      <Flex align="center" justify={isCollapsed ? 'center' : 'space-between'} px={isCollapsed ? 2 : 4} pb={3}>
        {!isCollapsed && (
          <Flex align="center" gap={2}>
            <Box
              bg={primaryGradient}
              w="32px"
              h="32px"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="sm"
            >
              <Icon as={FiMessageSquare} color="white" />
            </Box>
            <Text
              bgGradient={primaryGradient}
              bgClip="text"
              fontSize="lg"
              fontWeight="bold"
            >
              AI Chat
            </Text>
          </Flex>
        )}

        {isCollapsed && (
          <Box
            bg={primaryGradient}
            w="32px"
            h="32px"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="sm"
          >
            <Icon as={FiMessageSquare} color="white" />
          </Box>
        )}
        
        {/* Toggle collapse button (desktop only) */}
        {!isDrawer && (
          <IconButton
            icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            display={{ base: 'none', md: 'flex' }}
            position={isCollapsed ? 'static' : 'absolute'}
            right={isCollapsed ? 'auto' : -4}
            top={isCollapsed ? 'auto' : 6}
            transform={isCollapsed ? 'none' : 'translateX(50%)'}
            zIndex={2}
            bg={bgColor}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="full"
          />
        )}
      </Flex>

      {/* New Chat button */}
      <Box px={isCollapsed ? 2 : 4} mb={4}>
        <Button
          leftIcon={!isCollapsed ? <FiPlus /> : undefined}
          bgGradient={primaryGradient}
          color="white"
          w="full"
          justifyContent={isCollapsed ? 'center' : 'flex-start'}
          _hover={{
            bgGradient: useColorModeValue(
              'linear(to-r, brand.600, purple.600)',
              'linear(to-r, brand.500, purple.500)'
            ),
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          }}
          transition="all 0.2s"
          borderRadius="md"
          size={isCollapsed ? 'sm' : 'md'}
        >
          {isCollapsed ? <FiPlus /> : 'New Chat'}
        </Button>
      </Box>

      {/* Navigation */}
      <VStack align="stretch" spacing={0} px={isCollapsed ? 0 : 2}>
        {!isCollapsed && (
          <Text fontSize="xs" textTransform="uppercase" color={mutedColor} fontWeight="medium" px={2} pb={2}>
            Navigation
          </Text>
        )}
        
        {navItems.map((item) => (
          <Tooltip
            key={item.path}
            label={isCollapsed ? item.title : ''}
            placement="right"
            hasArrow
            isDisabled={!isCollapsed}
          >
            <Box>
              <NextLink href={item.path} passHref>
                <Button
                  as="a"
                  variant="ghost"
                  w="full"
                  justifyContent={isCollapsed ? 'center' : 'flex-start'}
                  leftIcon={!isCollapsed ? <Icon as={item.icon} /> : undefined}
                  borderRadius="md"
                  py={2}
                  px={isCollapsed ? 2 : 3}
                  my={0.5}
                  color={currentView === item.view ? 'brand.500' : textColor}
                  bg={currentView === item.view ? useColorModeValue('brand.50', 'rgba(113, 71, 247, 0.15)') : 'transparent'}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.700'),
                  }}
                  aria-current={currentView === item.view ? 'page' : undefined}
                  onClick={() => isDrawer && onClose()}
                >
                  {isCollapsed ? <Icon as={item.icon} /> : item.title}
                </Button>
              </NextLink>
            </Box>
          </Tooltip>
        ))}
      </VStack>

      {/* Recent Chats Section */}
      {chatList.length > 0 && (
        <Box mt={4}>
          <Divider mb={4} />
          
          <Box px={isCollapsed ? 0 : 2} mb={2}>
            {!isCollapsed && (
              <Flex align="center" justify="space-between" px={2} mb={2}>
                <Text fontSize="xs" textTransform="uppercase" color={mutedColor} fontWeight="medium">
                  Recent Chats
                </Text>
                <Badge colorScheme="brand" variant="subtle" fontSize="xs">
                  {chatList.length}
                </Badge>
              </Flex>
            )}
            
            <VStack align="stretch" spacing={1} maxH={isCollapsed ? 'calc(100vh - 300px)' : 'calc(100vh - 350px)'} overflowY="auto" pr={2}>
              {chatList.slice(0, 10).map((chat) => (
                <Tooltip
                  key={chat.id || chat._id}
                  label={isCollapsed ? chat.title : ''}
                  placement="right"
                  hasArrow
                  isDisabled={!isCollapsed}
                >
                  <Box>
                    <NextLink href={`/chat/${chat.id || chat._id}`} passHref>
                      <Button
                        as="a"
                        variant="ghost"
                        w="full"
                        justifyContent={isCollapsed ? 'center' : 'flex-start'}
                        borderRadius="md"
                        py={2}
                        px={isCollapsed ? 2 : 3}
                        color={currentChat === (chat.id || chat._id) ? 'brand.500' : textColor}
                        bg={currentChat === (chat.id || chat._id) ? useColorModeValue('brand.50', 'rgba(113, 71, 247, 0.15)') : 'transparent'}
                        _hover={{
                          bg: useColorModeValue('gray.100', 'gray.700'),
                        }}
                        onClick={() => isDrawer && onClose()}
                      >
                        {isCollapsed ? (
                          <Icon as={FiClock} />
                        ) : (
                          <Flex w="full" align="center">
                            <Icon as={FiClock} mr={2} />
                            <Box flex="1" textAlign="start" overflow="hidden">
                              <Text fontSize="sm" fontWeight="medium" isTruncated>
                                {chat.title || 'Unnamed Chat'}
                              </Text>
                              <Text fontSize="xs" color={mutedColor} isTruncated>
                                {formatDate(chat.lastActivity || chat.created || chat.createdAt)}
                              </Text>
                            </Box>
                          </Flex>
                        )}
                      </Button>
                    </NextLink>
                  </Box>
                </Tooltip>
              ))}
            </VStack>
          </Box>
        </Box>
      )}

      {/* Featured Bots - only when not collapsed */}
      {!isCollapsed && (
        <Box mt={4} px={4}>
          <Divider mb={4} />
          
          <Flex align="center" justify="space-between" mb={2}>
            <Text fontSize="xs" textTransform="uppercase" color={mutedColor} fontWeight="medium">
              Featured Bots
            </Text>
            <Badge colorScheme="yellow" variant="subtle" fontSize="xs">
              <Flex align="center">
                <Icon as={FiStar} mr={1} />
                New
              </Flex>
            </Badge>
          </Flex>
          
          <VStack align="stretch" spacing={2}>
            <FeaturedBotButton
              name="Code Wizard"
              description="Coding expert"
              colorScheme="blue"
              icon="👨‍💻"
              onClick={() => {
                router.push('/explore?category=coding');
                if (isDrawer) onClose();
              }}
            />
            
            <FeaturedBotButton
              name="Creative Muse"
              description="Writing assistant"
              colorScheme="purple"
              icon="✍️"
              onClick={() => {
                router.push('/explore?category=creative');
                if (isDrawer) onClose();
              }}
            />
            
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<FiSearch />}
              colorScheme="brand"
              mt={2}
              onClick={() => {
                router.push('/explore');
                if (isDrawer) onClose();
              }}
            >
              View All Bots
            </Button>
          </VStack>
        </Box>
      )}

      {/* Bottom user section */}
      <Box mt="auto" pt={4} px={isCollapsed ? 2 : 4}>
        <Divider mb={4} />
        
        {!isCollapsed ? (
          <>
            {/* Usage bar */}
            <Box mb={4}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="xs" fontWeight="medium">Usage</Text>
                <Text fontSize="xs">7,500 / 10,000</Text>
              </Flex>
              <Progress
                value={75}
                size="xs"
                colorScheme="brand"
                borderRadius="full"
              />
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FiZap />}
                colorScheme="brand"
                mt={2}
                w="full"
                onClick={() => router.push('/upgrade')}
              >
                Upgrade Plan
              </Button>
            </Box>
            
            {/* User menu */}
            <Flex align="center" justify="space-between">
              <Menu placement="top">
                <MenuButton
                  as={Button}
                  variant="ghost"
                  px={2}
                  py={1}
                  borderRadius="md"
                  w="full"
                  justifyContent="flex-start"
                >
                  <Flex align="center" w="full">
                    <Avatar 
                      size="sm" 
                      name="User Name" 
                      src="/images/avatar.jpg" 
                      mr={2}
                      borderWidth={2}
                      borderColor={bgColor}
                    />
                    <Box textAlign="start" flex="1" isTruncated>
                      <Text fontSize="sm" fontWeight="medium">
                        User Name
                      </Text>
                      <Text fontSize="xs" color={mutedColor} isTruncated>
                        user@example.com
                      </Text>
                    </Box>
                  </Flex>
                </MenuButton>
                <MenuList zIndex={10}>
                  <MenuItem icon={<FiUser />}>Profile</MenuItem>
                  <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                  <MenuItem icon={<FiBell />}>Notifications</MenuItem>
                  <MenuDivider />
                  <MenuItem icon={<FiLogOut />} color="red.500">Logout</MenuItem>
                </MenuList>
              </Menu>
              
              <IconButton
                icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                variant="ghost"
                size="sm"
                ml={2}
                aria-label="Toggle color mode"
                onClick={toggleColorMode}
                color={colorMode === 'light' ? 'gray.700' : 'yellow.300'}
              />
            </Flex>
          </>
        ) : (
          <VStack spacing={3}>
            <Tooltip label="Toggle theme" placement="right">
              <IconButton
                icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
                variant="ghost"
                size="sm"
                aria-label="Toggle color mode"
                onClick={toggleColorMode}
                color={colorMode === 'light' ? 'gray.700' : 'yellow.300'}
              />
            </Tooltip>
            
            <Tooltip label="User settings" placement="right">
              <Box>
                <Menu placement="top-end">
                  <MenuButton as="div">
                    <Avatar 
                      size="sm" 
                      name="User Name" 
                      src="/images/avatar.jpg"
                      borderWidth={2}
                      borderColor={bgColor}
                      cursor="pointer"
                    />
                  </MenuButton>
                  <MenuList zIndex={10}>
                    <MenuItem icon={<FiUser />}>Profile</MenuItem>
                    <MenuItem icon={<FiSettings />}>Settings</MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<FiLogOut />} color="red.500">Logout</MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Tooltip>
          </VStack>
        )}
      </Box>
    </Flex>
  );

  // Featured bot component (for consistent styling)
  const FeaturedBotButton = ({ name, description, colorScheme, icon, onClick }) => (
    <Button
      variant="ghost"
      justifyContent="flex-start"
      py={2}
      borderRadius="md"
      onClick={onClick}
      _hover={{
        bg: useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`),
        transform: 'translateX(3px)',
      }}
      transition="all 0.2s"
      w="full"
    >
      <HStack spacing={3} w="full">
        <Flex
          w="32px"
          h="32px"
          bg={useColorModeValue(`${colorScheme}.100`, `${colorScheme}.900`)}
          color={useColorModeValue(`${colorScheme}.700`, `${colorScheme}.300`)}
          borderRadius="md"
          align="center"
          justify="center"
          fontSize="lg"
        >
          {icon}
        </Flex>
        <Box flex="1">
          <Text fontSize="sm" fontWeight="medium">
            {name}
          </Text>
          <Text fontSize="xs" color={mutedColor}>
            {description}
          </Text>
        </Box>
        <Icon as={FiChevronRight} fontSize="sm" opacity={0.5} />
      </HStack>
    </Button>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <Box
        as="nav"
        position="fixed"
        top={0}
        left={0}
        h="full"
        w={isCollapsed ? '72px' : '280px'}
        bg={bgColor}
        borderRight="1px solid"
        borderColor={borderColor}
        transition="width 0.3s ease"
        zIndex={10}
        display={{ base: 'none', md: 'block' }}
        overflowY="auto"
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)'),
            borderRadius: '24px',
          },
        }}
      >
        <SidebarContent />
      </Box>

      {/* Mobile trigger button */}
      <IconButton
        aria-label="Open menu"
        icon={<FiMenu />}
        display={{ base: 'flex', md: 'none' }}
        position="fixed"
        top={4}
        left={4}
        size="md"
        zIndex={20}
        onClick={onOpen}
      />

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader p={0} />
          <DrawerBody p={0}>
            <SidebarContent isDrawer={true} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Spacer to push content to the right */}
      <Box
        display={{ base: 'none', md: 'block' }}
        w={isCollapsed ? '72px' : '280px'}
        flexShrink={0}
        transition="width 0.3s ease"
      />
    </>
  );
};

export default Sidebar;