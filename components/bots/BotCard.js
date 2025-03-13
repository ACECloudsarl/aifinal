// components/bots/BotCard.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Button,
  IconButton,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Card,
  CardBody,
  CardFooter,
  useColorModeValue,
  Flex,
  Tooltip,
  Tag,
  Skeleton,
  useDisclosure,
  Collapse,
  TagLeftIcon,
  Link
} from '@chakra-ui/react';
import { 
  FiMessageSquare, 
  FiStar, 
  FiPlus, 
  FiClock, 
  FiMoreHorizontal,
  FiZap,
  FiChevronDown,
  FiChevronUp,
  FiUser
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const BotCard = ({ bot, recentChats = [] }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  
  // Function to start a completely new chat with this bot
  const handleStartNewChat = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    
    try {
      // Force create a new chat with this bot
      const response = await fetch('/api/chats/force-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: bot.id,
          title: 'New Chat with ' + bot.name,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      
      const chatData = await response.json();
      
      // Navigate to the newly created chat with timestamp to avoid caching
      const timestamp = new Date().getTime();
      router.push(`/chat/${chatData.id}?new=${timestamp}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create new chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Open a specific existing chat
  const handleOpenChat = (chatId) => {
    router.push(`/chat/${chatId}`);
  };
  
  return (
    <Card
      variant="outline"
      bg={cardBg}
      borderColor={cardBorder}
      h="full"
      display="flex"
      flexDirection="column"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-8px)',
        boxShadow: 'lg',
        borderColor: 'purple.300',
      }}
      position="relative"
      overflow="visible"
      borderRadius="xl"
    >
      {/* Popularity Badge */}
      {bot.popularity > 90 && (
        <Badge 
          position="absolute" 
          top="-2" 
          right="-2" 
          colorScheme="purple" 
          borderRadius="full" 
          px={2}
          py={1}
          fontSize="xs"
          fontWeight="bold"
          zIndex={2}
          boxShadow="md"
        >
          <HStack spacing={1}>
            <FiZap size={12} />
            <Text>Popular</Text>
          </HStack>
        </Badge>
      )}
      
      <CardBody p={5}>
        <HStack spacing={4} align="start" mb={4}>
          <Avatar
            src={bot.avatar}
            name={bot.name}
            size="xl"
            borderRadius="lg"
            bg="purple.500"
            color="white"
            boxShadow="sm"
            border="3px solid"
            borderColor={useColorModeValue('white', 'gray.800')}
          />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="bold" fontSize="xl">
              {bot.name}
            </Text>
            <HStack spacing={2} flexWrap="wrap">
              <Tag colorScheme="gray" variant="subtle" size="sm">
                {bot.category}
              </Tag>
              <Tag 
                colorScheme="yellow" 
                variant="subtle"
                size="sm"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <TagLeftIcon as={FiStar} boxSize={3} />
                <Text>4.8</Text>
              </Tag>
              {bot.isNew && (
                <Tag colorScheme="purple" size="sm">New</Tag>
              )}
            </HStack>
          </VStack>
        </HStack>
        
        <Text color={mutedColor} fontSize="sm" noOfLines={3} mb={2}>
          {bot.description}
        </Text>
        
        {/* Skills/Features */}
        <Flex mt={2} gap={2} flexWrap="wrap">
          {['Fast Responses', 'Image Generation', 'Web Search'].map((skill, index) => (
            <Tag 
              key={index} 
              size="sm" 
              colorScheme="gray" 
              variant="subtle"
            >
              {skill}
            </Tag>
          ))}
        </Flex>
      </CardBody>
      
      <Divider borderColor={cardBorder} />
      
      <CardFooter py={3} px={4}>
        <VStack width="full" spacing={2}>
          <HStack width="full">
            <Button
              leftIcon={<FiPlus />}
              colorScheme="purple"
              isFullWidth
              onClick={handleStartNewChat}
              isLoading={loading}
              loadingText="Creating..."
              size="md"
              borderRadius="md"
              fontWeight="medium"
            >
              New Chat
            </Button>
            
            {recentChats.length > 0 && (
              <Menu closeOnSelect={true} placement="bottom-end">
                <MenuButton
                  as={IconButton}
                  icon={<FiClock />}
                  variant="outline"
                  aria-label="Recent Chats"
                  colorScheme="gray"
                />
                <MenuList>
                  <Text px={3} py={1} fontSize="xs" fontWeight="bold" color={mutedColor}>
                    RECENT CHATS
                  </Text>
                  <Divider my={1} />
                  {recentChats.map((chat) => (
                    <MenuItem 
                      key={chat.id} 
                      icon={<FiMessageSquare />}
                      onClick={() => handleOpenChat(chat.id)}
                    >
                      <VStack align="start" spacing={0}>
                        <Text noOfLines={1}>{chat.title}</Text>
                        <Text fontSize="xs" color={mutedColor}>
                          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                        </Text>
                      </VStack>
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            )}
          </HStack>
          
          {/* User count and toggle details button */}
          <HStack width="full" justify="space-between" fontSize="xs" color={mutedColor}>
            <HStack>
              <FiUser size={12} />
              <Text>{(bot.userCount || 2500).toLocaleString()} users</Text>
            </HStack>
            
            <Link onClick={onToggle} _hover={{ textDecoration: 'none' }}>
              <HStack>
                <Text>{isOpen ? 'Hide details' : 'More details'}</Text>
                {isOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
              </HStack>
            </Link>
          </HStack>
          
          {/* Collapsible details section */}
          <Collapse in={isOpen} animateOpacity>
            <Box pt={2} width="full">
              <Divider mb={2} />
              <VStack align="start" spacing={2} fontSize="sm">
                <HStack justify="space-between" width="full">
                  <Text fontWeight="medium">Model:</Text>
                  <Text color={mutedColor} fontFamily="mono">{bot.model || 'Llama-3-70B'}</Text>
                </HStack>
                <HStack justify="space-between" width="full">
                  <Text fontWeight="medium">Response Time:</Text>
                  <Text color={mutedColor}>~5 seconds</Text>
                </HStack>
                <HStack justify="space-between" width="full">
                  <Text fontWeight="medium">Created:</Text>
                  <Text color={mutedColor}>
                    {bot.createdAt 
                      ? formatDistanceToNow(new Date(bot.createdAt), { addSuffix: true })
                      : '3 months ago'}
                  </Text>
                </HStack>
              </VStack>
            </Box>
          </Collapse>
        </VStack>
      </CardFooter>
    </Card>
  );
};

// Loading skeleton version of the card
export const BotCardSkeleton = () => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Card
      variant="outline"
      bg={cardBg}
      borderColor={cardBorder}
      h="full"
      display="flex"
      flexDirection="column"
      borderRadius="xl"
    >
      <CardBody p={5}>
        <HStack spacing={4} align="start" mb={4}>
          <Skeleton
            width="80px"
            height="80px"
            borderRadius="lg"
          />
          <VStack align="start" spacing={2} flex={1}>
            <Skeleton height="28px" width="140px" />
            <HStack spacing={2}>
              <Skeleton height="20px" width="80px" />
              <Skeleton height="20px" width="60px" />
            </HStack>
          </VStack>
        </HStack>
        
        <VStack align="start" spacing={2} width="full">
          <Skeleton height="16px" width="full" />
          <Skeleton height="16px" width="full" />
          <Skeleton height="16px" width="80%" />
        </VStack>
        
        <HStack mt={4} spacing={2}>
          <Skeleton height="20px" width="80px" />
          <Skeleton height="20px" width="120px" />
        </HStack>
      </CardBody>
      
      <Divider />
      
      <CardFooter py={3} px={4}>
        <Skeleton height="40px" width="full" />
      </CardFooter>
    </Card>
  );
};

export default BotCard;