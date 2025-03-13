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
} from '@chakra-ui/react';
import { 
  FiMessageSquare, 
  FiStar, 
  FiPlus, 
  FiClock, 
  FiMoreHorizontal 
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const BotCard = ({ bot, recentChats = [] }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
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
      transition="all 0.2s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg',
      }}
    >
      <CardBody>
        <HStack spacing={4} align="start" mb={4}>
          <Avatar
            src={bot.avatar}
            name={bot.name}
            size="xl"
            borderRadius="lg"
          />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="bold" fontSize="lg">
              {bot.name}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme="gray" variant="subtle">
                {bot.category}
              </Badge>
              <Badge 
                colorScheme="yellow" 
                variant="subtle"
                display="flex"
                alignItems="center"
                gap={1}
              >
                <FiStar size={14} />
                4.8
              </Badge>
            </HStack>
          </VStack>
        </HStack>
        
        <Text color="gray.500" fontSize="sm">
          {bot.description}
        </Text>
      </CardBody>
      
      <CardFooter>
        <HStack width="full">
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            isFullWidth
            onClick={handleStartNewChat}
            isLoading={loading}
            mr={2}
          >
            New Chat
          </Button>
          
          {recentChats.length > 0 && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiClock />}
                variant="outline"
                aria-label="Recent Chats"
              />
              <MenuList>
                <MenuItem 
                  icon={<Text fontSize="xs" fontWeight="bold">Recent Chats</Text>}
                  isReadOnly
                />
                <Divider />
                {recentChats.map((chat) => (
                  <MenuItem 
                    key={chat.id} 
                    icon={<FiMessageSquare />}
                    onClick={() => handleOpenChat(chat.id)}
                  >
                    <VStack align="start" spacing={0}>
                      <Text>{chat.title}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                      </Text>
                    </VStack>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default BotCard;