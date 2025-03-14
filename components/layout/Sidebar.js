// components/layout/Sidebar.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import LanguageSelector from './LanguageSelector';
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
  VStack,
  HStack,
  Heading,
  Collapse,
  Skeleton,
  Circle,
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
  FiChevronDown,
  FiMoreHorizontal,
} from 'react-icons/fi';

const Sidebar = ({ 
  currentView, 
  currentChat, 
  chatList = [],
  isOpen,
  onClose,
  isCollapsed,
  toggleSidebar
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Load data simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  const brandLight = useColorModeValue('brand.50', 'rgba(94, 46, 255, 0.15)');
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
    { icon: FiSearch, title: 'Explore Bots', path: '/explore', view: 'explore', badge: 'New' },
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
    <Flex direction="column" h="100%" py={4}>
      {/* Sidebar Header */}
      <Flex 
        align="center" 
        justify={isCollapsed ? 'center' : 'space-between'} 
        px={isCollapsed ? 2 : 5} 
        pb={4}
      >
        {!isCollapsed && (
          <Flex align="center" gap={3}>
            <Box
              bgGradient={primaryGradient}
              w="36px"
              h="36px"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="md"
            >
              <Icon as={FiMessageSquare} color="white" boxSize={5} />
            </Box>
            <Text
              bgGradient={primaryGradient}
              bgClip="text"
              fontSize="lg"
              fontWeight="bold"
              letterSpacing="-0.01em"
            >
              AI Chat
            </Text>
          </Flex>
        )}

        {isCollapsed && (
          <Box
            bgGradient={primaryGradient}
            w="40px"
            h="40px"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="md"
          >
            <Icon as={FiMessageSquare} color="white" boxSize={5} />
          </Box>
        )}
        
        {/* Toggle collapse button (desktop only) */}
        {!isDrawer && (
          <IconButton
            icon={isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            display={{ base: 'none', md: 'flex' }}
            position={isCollapsed ? 'static' : 'absolute'}
            right={isCollapsed ? 'auto' : -4}
            top={isCollapsed ? 'auto' : 20}
            transform={isCollapsed ? 'none' : 'translateX(50%)'}
            zIndex={2}
            bg={bgColor}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="full"
            boxShadow="sm"
            color={textColor}
          />
        )}
      </Flex>

      {/* New Chat button */}
      <Box px={isCollapsed ? 2 : 5} mb={6}>
        <Button
          leftIcon={!isCollapsed ? <FiPlus size={14} /> : undefined}
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
          boxShadow="sm"
          py={isCollapsed ? 3 : 3}
        >
          {isCollapsed ? <FiPlus size={16} /> : 'New Chat'}
        </Button>
      </Box>

      {/* Navigation */}
      <VStack align="stretch" spacing={1} px={isCollapsed ? 2 : 5} mb={6}>
        {!isCollapsed && (
          <Text 
            fontSize="xs" 
            textTransform="uppercase" 
            color={mutedColor} 
            fontWeight="semibold" 
            mb={2}
            pl={2}
          >
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
            openDelay={300}
          >
            <Box>
              <NextLink href={item.path} passHref>
                <Button
                  as="a"
                  variant="ghost"
                  w="full"
                  justifyContent={isCollapsed ? 'center' : 'flex-start'}
                  leftIcon={!isCollapsed ? (
                    <Flex
                      align="center"
                      justify="center"
                      boxSize="28px"
                      borderRadius="md"
                      bg={currentView === item.view ? brandLight : 'transparent'}
                      color={currentView === item.view ? 'brand.500' : mutedColor}
                    >
                      <Icon as={item.icon} boxSize={4} />
                    </Flex>
                  ) : undefined}
                  borderRadius="lg"
                  py={2.5}
                  px={isCollapsed ? 2 : 3}
                  my={0.5}
                  color={currentView === item.view ? 'brand.500' : textColor}
                  bg={currentView === item.view ? brandLight : 'transparent'}
                  fontWeight={currentView === item.view ? 'medium' : 'normal'}
                  _hover={{
                    bg: useColorModeValue('gray.100', 'gray.800'),
                  }}
                  aria-current={currentView === item.view ? 'page' : undefined}
                  onClick={() => isDrawer && onClose()}
                  position="relative"
                >
                  {isCollapsed ? (
                    <Flex
                      align="center"
                      justify="center"
                      boxSize="32px"
                      borderRadius="md"
                      bg={currentView === item.view ? brandLight : 'transparent'}
                      color={currentView === item.view ? 'brand.500' : mutedColor}
                    >
                      <Icon as={item.icon} boxSize={4} />
                    </Flex>
                  ) : (
                    <>
                      {item.title}
                      {item.badge && (
                        <Badge 
                          colorScheme="purple" 
                          ml={2} 
                          fontSize="2xs"
                          px={1.5}
                          py={0.5}
                          borderRadius="full"
                          textTransform="uppercase"
                          fontWeight="bold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  
                  {/* Badge for collapsed mode */}
                  {isCollapsed && item.badge && (
                    <Badge
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      colorScheme="purple"
                      borderRadius="full"
                      width="8px"
                      height="8px"
                      p={0}
                    />
                  )}
                </Button>
              </NextLink>
            </Box>
          </Tooltip>
        ))}
      </VStack>

      {/* Recent Chats Section */}
      <Box>
        <Divider mb={4} opacity={0.6} />
        
        <Box px={isCollapsed ? 2 : 5} mb={2}>
          {!isCollapsed && (
            <Flex align="center" justify="space-between" mb={3}>
              <Text fontSize="xs" textTransform="uppercase" color={mutedColor} fontWeight="semibold" pl={2}>
                Recent Chats
              </Text>
              <Badge 
                colorScheme="brand" 
                variant="subtle" 
                fontSize="2xs"
                borderRadius="full"
                px={2}
              >
                {chatList.length}
              </Badge>
            </Flex>
          )}
          
          <VStack 
            align="stretch" 
            spacing={1} 
            maxH={isCollapsed ? 'calc(100vh - 330px)' : 'calc(100vh - 380px)'} 
            overflowY="auto" 
            pr={2}
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
            {isLoading ? (
              // Loading skeletons for recent chats
              Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} height="48px" startColor={useColorModeValue('gray.100', 'gray.800')} endColor={useColorModeValue('gray.200', 'gray.700')} my={1} borderRadius="lg" />
              ))
            ) : chatList.length === 0 ? (
              <Box 
                p={4} 
                textAlign="center" 
                bg={useColorModeValue('gray.50', 'gray.800')} 
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                borderStyle="dashed"
              >
                <Text fontSize="sm" color={mutedColor}>No recent chats</Text>
                <Button
                  leftIcon={<FiPlus size={14} />}
                  colorScheme="brand"
                  variant="link"
                  size="sm"
                  mt={2}
                >
                  Start a new conversation
                </Button>
              </Box>
            ) : (
              chatList.slice(0, 10).map((chat) => (
                <Tooltip
                  key={chat.id || chat._id}
                  label={isCollapsed ? chat.title : ''}
                  placement="right"
                  hasArrow
                  isDisabled={!isCollapsed}
                  openDelay={300}
                >
                  <Box>
                    <NextLink href={`/chat/${chat.id || chat._id}`} passHref>
                      <Button
                        as="a"
                        variant="ghost"
                        w="full"
                        justifyContent={isCollapsed ? 'center' : 'flex-start'}
                        borderRadius="lg"
                        py={2}
                        px={isCollapsed ? 2 : 3}
                        color={currentChat === (chat.id || chat._id) ? 'brand.500' : textColor}
                        bg={currentChat === (chat.id || chat._id) ? brandLight : 'transparent'}
                        fontWeight={currentChat === (chat.id || chat._id) ? 'medium' : 'normal'}
                        _hover={{
                          bg: useColorModeValue('gray.100', 'gray.800'),
                        }}
                        onClick={() => isDrawer && onClose()}
                      >
                        {isCollapsed ? (
                          <Circle 
                            size="32px" 
                            bg={currentChat === (chat.id || chat._id) ? brandLight : useColorModeValue('gray.100', 'gray.800')}
                            color={currentChat === (chat.id || chat._id) ? 'brand.500' : mutedColor}
                          >
                            <Icon as={FiMessageSquare} boxSize={4} />
                          </Circle>
                        ) : (
                          <Flex w="full" align="center">
                            <Circle 
                              size="32px" 
                              bg={currentChat === (chat.id || chat._id) ? brandLight : useColorModeValue('gray.100', 'gray.800')}
                              color={currentChat === (chat.id || chat._id) ? 'brand.500' : mutedColor}
                              mr={3}
                            >
                              <Icon as={FiMessageSquare} boxSize={4} />
                            </Circle>
                            <Box flex="1" textAlign="start" overflow="hidden">
                              <Text fontSize="sm" fontWeight={currentChat === (chat.id || chat._id) ? "medium" : "normal"} isTruncated>
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
              ))
            )}
          </VStack>
        </Box>
      </Box>

      {/* Featured Bots - only when not collapsed */}
      {!isCollapsed && (
        <Box mt={6} px={5}>
          <Divider mb={4} opacity={0.6} />
          
          <Flex align="center" justify="space-between" mb={3}>
            <Text fontSize="xs" textTransform="uppercase" color={mutedColor} fontWeight="semibold" pl={2}>
              Featured Bots
            </Text>
            <Badge 
              colorScheme="yellow" 
              variant="subtle" 
              borderRadius="full"
              fontSize="2xs"
              px={2}
            >
              <Flex align="center">
                <Icon as={FiStar} mr={1} boxSize={3} />
                Featured
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
              leftIcon={<FiSearch size={14} />}
              colorScheme="brand"
              mt={2}
              borderRadius="md"
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

      <LanguageSelector>
        
      </LanguageSelector>

      {/* Bottom user section */}
      <Box mt="auto" pt={4} px={isCollapsed ? 2 : 5}>
        <Divider mb={4} opacity={0.6} />
        
        {!isCollapsed ? (
          <>
            {/* Usage bar */}
            <Box mb={4}>
              <Flex justify="space-between" mb={1}>
                <Text fontSize="xs" fontWeight="medium">Usage</Text>
                <Text fontSize="xs" color={mutedColor}>7,500 / 10,000</Text>
              </Flex>
              <Progress
                value={75}
                size="xs"
                colorScheme="brand"
                borderRadius="full"
                bg={useColorModeValue('gray.100', 'gray.700')}
              />
              <Button
                size="sm"
                variant="outline"
                leftIcon={<FiZap size={14} />}
                colorScheme="brand"
                mt={3}
                w="full"
                onClick={() => router.push('/upgrade')}
                borderRadius="md"
              >
                Upgrade Plan
              </Button>
            </Box>
            
            {/* User menu */}
            <Menu placement="top-end">
              <MenuButton
                as={Button}
                variant="ghost"
                px={2}
                py={2}
                borderRadius="lg"
                w="full"
                justifyContent="flex-start"
                _hover={{ bg: useColorModeValue('gray.100', 'gray.800') }}
              >
                <Flex align="center" w="full">
                  <Avatar 
                    size="sm" 
                    name="User Name" 
                    src="/images/avatar.jpg" 
                    mr={3}
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
                  <Icon as={FiMoreHorizontal} color={mutedColor} boxSize={4} />
                </Flex>
              </MenuButton>
              <MenuList zIndex={10}>
                <MenuItem icon={<FiUser fontSize="1.1em" />}>Profile</MenuItem>
                <MenuItem icon={<FiSettings fontSize="1.1em" />}>Settings</MenuItem>
                <MenuItem icon={<FiBell fontSize="1.1em" />}>Notifications</MenuItem>
                <MenuDivider />
                <MenuItem icon={<FiLogOut fontSize="1.1em" />} color="red.500">Logout</MenuItem>
              </MenuList>
            </Menu>
            
            <Flex justify="flex-end" mt={3}>
              <IconButton
                icon={colorMode === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
                variant="ghost"
                size="sm"
                aria-label="Toggle color mode"
                onClick={toggleColorMode}
                color={colorMode === 'light' ? 'gray.700' : 'yellow.300'}
              />
            </Flex>
          </>
        ) : (
          <VStack spacing={4} align="center">
            <Tooltip label="Toggle theme" placement="right" openDelay={300}>
              <IconButton
                icon={colorMode === 'light' ? <FiMoon size={16} /> : <FiSun size={16} />}
                variant="ghost"
                size="sm"
                aria-label="Toggle color mode"
                onClick={toggleColorMode}
                color={colorMode === 'light' ? 'gray.700' : 'yellow.300'}
              />
            </Tooltip>
            
            <Tooltip label="User settings" placement="right" openDelay={300}>
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
                      _hover={{ 
                        transform: 'scale(1.05)',
                        boxShadow: 'sm'
                      }}
                      transition="all 0.2s"
                    />
                  </MenuButton>
                  <MenuList zIndex={10}>
                    <VStack align="start" px={3} pb={2} mb={2} borderBottom="1px solid" borderColor={borderColor}>
                      <Text fontWeight="medium">User Name</Text>
                      <Text fontSize="xs" color={mutedColor}>user@example.com</Text>
                    </VStack>
                    <MenuItem icon={<FiUser fontSize="1.1em" />}>Profile</MenuItem>
                    <MenuItem icon={<FiSettings fontSize="1.1em" />}>Settings</MenuItem>
                    <MenuDivider />
                    <MenuItem icon={<FiLogOut fontSize="1.1em" />} color="red.500">Logout</MenuItem>
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
      p={3}
      borderRadius="lg"
      onClick={onClick}
      _hover={{
        bg: useColorModeValue(`${colorScheme}.50`, `${colorScheme}.900`),
        transform: 'translateX(3px)',
      }}
      transition="all 0.2s"
      w="full"
      height="auto"
    >
      <HStack spacing={3} w="full" align="center">
        <Flex
          w="36px"
          h="36px"
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
        w={isCollapsed ? '80px' : '280px'}
        bg={bgColor}
        borderRight="1px solid"
        borderColor={borderColor}
        transition="all 0.3s ease"
        zIndex={20}
        display={{ base: 'none', md: 'block' }}
        overflowY="auto"
        boxShadow={useColorModeValue('sm', 'none')}
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

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay backdropFilter="blur(4px)" bg="blackAlpha.600" />
        <DrawerContent>
          <DrawerCloseButton mt={3} />
          <DrawerHeader p={0} />
          <DrawerBody p={0}>
            <SidebarContent isDrawer={true} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar;