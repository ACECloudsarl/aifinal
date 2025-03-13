// pages/chat/[botId].js - Redesigned
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import withAuth from '../../lib/withAuth';
import {
  Box, 
  VStack, 
  HStack, 
  Text, 
  Avatar, 
  Spinner, 
  Alert, 
  AlertIcon,
  AlertTitle,
  useColorModeValue,
  Container,
  Divider,
  Flex,
  IconButton,
  Tooltip,
  Skeleton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiMenu, FiArrowLeft, FiInfo, FiX } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import ChatMessage from '../../components/chat/ChatMessage';
import ChatInput from '../../components/chat/ChatInput';

function Chat() {
  const router = useRouter();
  const { chatId: urlChatId, botId: urlBotId } = router.query;
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [streamingMessage, setStreamingMessage] = useState("");

  const [bot, setBot] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [tokenUsage, setTokenUsage] = useState({ used: 0, total: 4000 });
  const [error, setError] = useState(null);
  const [messagesWithImages, setMessagesWithImages] = useState({});
  
  // Mobile drawer for bot info
  const { isOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();
  const messagesEndRef = useRef(null);
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerMaxW = useBreakpointValue({ base: "100%", md: "768px", lg: "800px", xl: "900px" });

  // Colors
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headerBgColor = useColorModeValue("white", "gray.800");
  const avatarBg = useColorModeValue("gray.100", "gray.700");
  
  // Initialization effect - this runs first to set up the chat
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsInitializing(true);
        setError(null);

        const pathParam = router.query.botId;
        const effectiveChatId = router.query.chatId || pathParam;
        
        // Case 1: Direct navigation to a specific chat - use chatId from URL
        if (effectiveChatId) {
          console.log("Loading existing chat:", effectiveChatId);
          setChatId(effectiveChatId);
          
          try {
            // Get chat data
            const chatResponse = await fetch(`/api/chats/${urlChatId}`);
            if (!chatResponse.ok) {
              throw new Error(`Chat fetch failed: ${chatResponse.status}`);
            }
            const chatData = await chatResponse.json();
            
            // Handle potentially missing bot
            if (chatData.bot) {
              setBot(chatData.bot);
            } else {
              // Fallback bot data when the actual bot can't be found
              setBot({
                name: "Unknown Bot",
                description: "This bot could not be found. It may have been deleted.",
                avatar: "/images/unknown-bot.png",
              });
              console.warn("Bot not found for chat:", urlChatId);
            }
            
            // Get messages
            const messagesResponse = await fetch(`/api/chats/${urlChatId}/messages`);
            if (!messagesResponse.ok) {
              throw new Error(`Messages fetch failed: ${messagesResponse.status}`);
            }
            const messagesData = await messagesResponse.json();
            setMessages(messagesData);
          } catch (error) {
            console.error("Error fetching chat data:", error);
            setError(`Failed to load chat: ${error.message}`);
          }
        }
        // Case 2: Starting a new chat with a bot - use botId from URL
        else if (router.query.botId) {
          const urlBotId = router.query.botId;
          console.log("Creating new chat with bot:", urlBotId);
          
          // First try to fetch the bot details
          try {
            const botResponse = await fetch(`/api/bots/${urlBotId}`);
            if (!botResponse.ok) {
              if (botResponse.status === 404) {
                setError("Bot not found. It may have been deleted or is unavailable.");
                setIsInitializing(false);
                return; // Stop execution if bot not found
              } else {
                throw new Error(`Failed to fetch bot: ${botResponse.status}`);
              }
            }
            
            const botData = await botResponse.json();
            setBot(botData);
            
            // Then create a new chat with this bot
            const createResponse = await fetch('/api/chats', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                botId: urlBotId,
                title: `Chat with ${botData.name}`,
              }),
            });
            
            if (!createResponse.ok) {
              throw new Error(`Failed to create chat: ${createResponse.status}`);
            }
            
            const newChat = await createResponse.json();
            
            // Update the URL without full navigation
            router.replace(`/chat/${newChat.id}`, undefined, { shallow: true });
            
            // Set the chat ID
            setChatId(newChat.id);
            
            // Initialize with empty messages array
            setMessages([]);
          } catch (error) {
            console.error("Error in bot/chat creation:", error);
            setError(`Failed to initialize chat: ${error.message}`);
          }
        }
        // Case 3: Invalid URL parameters
        else {
          setError("Missing chat or bot ID");
          console.error("No valid chatId or botId found in URL");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError(`Failed to initialize chat: ${error.message}`);
      } finally {
        setIsInitializing(false);
      }
    };
    
    // Only run when URL parameters or session changes
    if (router.isReady && session) {
      initializeChat();
    }
  }, [router.isReady, router.query, session, router]);
  
  // Load chat data and messages once chatId is set
  useEffect(() => {
    const loadChatData = async () => {
      if (!chatId || isInitializing) return;
      
      try {
        console.log("Loading data for chat:", chatId);
        
        // Reset state
        setMessages([]);
        setStreamingMessage(null);
        
        // Fetch chat and bot details
        const chatResponse = await fetch(`/api/chats/${chatId}`);
        if (!chatResponse.ok) throw new Error('Failed to fetch chat');
        const chatData = await chatResponse.json();
        
        // Set bot data
        setBot(chatData.bot);
        
        // Fetch messages for this chat
        const messagesResponse = await fetch(`/api/chats/${chatId}/messages`);
        if (!messagesResponse.ok) throw new Error('Failed to fetch messages');
        const messagesData = await messagesResponse.json();
        setMessages(messagesData);
      } catch (error) {
        console.error("Error loading chat data:", error);
        setError("Failed to load chat. Please try again.");
      }
    };
    
    loadChatData();
  }, [chatId, isInitializing]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingMessage]);
  
  const handleSendMessage = async (content) => {
    if (!chatId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add optimistic user message
      const userMessage = {
        id: `temp-${Date.now()}`,
        content,
        role: "user",
        createdAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Check if we should use streaming
      const useStreaming = !content.toLowerCase().includes("generate") && 
                         !content.toLowerCase().includes("create an image") &&
                         !content.toLowerCase().includes("draw");
      
      if (useStreaming) {
        // Create a streaming message placeholder
        const streamingMessageId = `streaming-${Date.now()}`;
        let streamContent = "";
        
        setStreamingMessage({
          id: streamingMessageId,
          content: "",
          role: "assistant",
          createdAt: new Date().toISOString(),
        });
        
        // Set up the event source
        const eventSource = new EventSource(`/api/chats/${chatId}/messages?stream=true&content=${encodeURIComponent(content)}`);
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.content) {
            streamContent += data.content;
            setStreamingMessage(prev => ({
              ...prev,
              content: streamContent,
            }));
          }
          
          if (data.done) {
            eventSource.close();
            setIsLoading(false);
            
            // Add the final message
            setMessages(prev => [
              ...prev.filter(msg => msg.id !== userMessage.id),
              userMessage,
              {
                id: data.messageId,
                content: streamContent,
                role: "assistant",
                createdAt: new Date().toISOString(),
              },
            ]);
            
            setStreamingMessage(null);
          }
        };
        
        eventSource.onerror = () => {
          eventSource.close();
          setIsLoading(false);
          setError("Error streaming response. Please try again.");
          setStreamingMessage(null);
        };
      } else {
        // Non-streaming request (for image generation)
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        const assistantMessage = await response.json();
        
        // Replace optimistic message with real one and add assistant response
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== userMessage.id),
          {
            id: Date.now().toString(),
            content,
            role: "user",
            createdAt: new Date().toISOString(),
          },
          assistantMessage,
        ]);
        
        // Update token usage
        if (assistantMessage.tokens) {
          setTokenUsage(prev => ({
            ...prev,
            used: prev.used + assistantMessage.tokens,
          }));
        }
        
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setIsLoading(false);
    }
  };

  // This callback is called by ImageGenerator to update the UI immediately
  const handleImageGenerated = (prompt, imageUrl, index) => {
    console.log(`Image generated for prompt: ${prompt.substring(0, 30)}... URL: ${imageUrl}`);
    
    // Store the generated image in local state
    setMessagesWithImages(prev => ({
      ...prev,
      [prompt]: imageUrl
    }));
  };

  // When streaming is complete and we get a permanent ID, save images to the database
  useEffect(() => {
    const saveImagesToPermanentMessage = async () => {
      // Find the most recently added message that isn't a user message
      const lastMessage = messages.length > 0 ? 
        [...messages].reverse().find(msg => msg.role !== 'user') : null;
      
      // Only proceed if:
      // 1. We have a last message
      // 2. It has a valid MongoDB ID (not a streaming ID)
      // 3. We have local images that need saving
      if (
        lastMessage && 
        lastMessage.id && 
        !lastMessage.id.startsWith('streaming-') && 
        !lastMessage.id.startsWith('temp-') &&
        Object.keys(messagesWithImages).length > 0
      ) {
        console.log(`Saving images for permanent message ID: ${lastMessage.id}`);
        
        // Extract image tags from the message
        const regex = /\[\!\|(.*?)\|\!\]/g;
        const content = lastMessage.content || '';
        let match;
        
        while ((match = regex.exec(content)) !== null) {
          const prompt = match[1].trim();
          const imageUrl = messagesWithImages[prompt];
          
          if (prompt && imageUrl) {
            try {
              // Call API to update the message metadata
              const response = await fetch(`/api/messages/${lastMessage.id}/storeImage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  prompt,
                  imageUrl,
                  index: 0 // We don't really need an index anymore
                }),
              });
              
              if (response.ok) {
                console.log(`Successfully saved image for prompt: ${prompt.substring(0, 30)}...`);
              } else {
                console.error(`Failed to save image for prompt: ${prompt.substring(0, 30)}...`);
              }
            } catch (error) {
              console.error(`Error saving image for prompt: ${prompt.substring(0, 30)}...`, error);
            }
          }
        }
      }
    };
    
    saveImagesToPermanentMessage();
  }, [messages, messagesWithImages]);
  
  const handleCopy = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };
  
  const handleRegenerate = async (messageId) => {
    if (!chatId) return;
    
    // Find the message to regenerate
    const index = messages.findIndex(msg => msg.id === messageId);
    if (index === -1) return;
    
    // Get all messages up to but not including the one to regenerate
    const messagesToKeep = messages.slice(0, index);
    setMessages(messagesToKeep);
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the last user message before this assistant message
      const lastUserMessage = messagesToKeep
        .filter(msg => msg.role === 'user')
        .pop();
      
      if (!lastUserMessage) {
        throw new Error('No user message found to regenerate from');
      }
      
      // Re-send the last user message to generate a new response
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: lastUserMessage.content }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate message');
      }
      
      const regeneratedMessage = await response.json();
      
      // Add the regenerated assistant message
      setMessages(prev => [...prev, regeneratedMessage]);
      
      // Update token usage
      if (regeneratedMessage.tokens) {
        setTokenUsage(prev => ({
          ...prev,
          used: prev.used + regeneratedMessage.tokens,
        }));
      }
    } catch (error) {
      console.error('Error regenerating message:', error);
      setError('Failed to regenerate message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSpeak = (content) => {
    // Use the Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  // Initialization loading state - using skeleton now
  if (isInitializing) {
    return (
      <Layout hideNav={isMobile}>
        <Box bg={bgColor} minH="100vh">
          <Container maxW={containerMaxW} px={0} h="100vh" display="flex" flexDirection="column">
            {/* Header Skeleton */}
            <Flex 
              p={3} 
              borderBottom="1px solid" 
              borderColor={borderColor} 
              align="center"
              position="sticky"
              top={0}
              bg={headerBgColor}
              zIndex={10}
            >
              <Skeleton height="40px" width="40px" borderRadius="full" mr={3} />
              <VStack align="start" spacing={1} flex="1">
                <Skeleton height="20px" width="150px" />
                <Skeleton height="16px" width="200px" />
              </VStack>
            </Flex>
            
            {/* Messages Skeleton */}
            <Box flex="1" overflowY="auto" p={4}>
              <VStack spacing={6} align="stretch">
                <HStack align="flex-start" spacing={3}>
                  <Skeleton height="40px" width="40px" borderRadius="full" />
                  <VStack align="start" spacing={2} flex="1">
                    <Skeleton height="20px" width="80px" />
                    <Skeleton height="60px" width="100%" borderRadius="md" />
                  </VStack>
                </HStack>
                
                <HStack align="flex-start" spacing={3} alignSelf="flex-end">
                  <VStack align="end" spacing={2} flex="1">
                    <Skeleton height="20px" width="80px" />
                    <Skeleton height="40px" width="80%" borderRadius="md" />
                  </VStack>
                  <Skeleton height="40px" width="40px" borderRadius="full" />
                </HStack>
                
                <HStack align="flex-start" spacing={3}>
                  <Skeleton height="40px" width="40px" borderRadius="full" />
                  <VStack align="start" spacing={2} flex="1">
                    <Skeleton height="20px" width="80px" />
                    <Skeleton height="80px" width="100%" borderRadius="md" />
                  </VStack>
                </HStack>
              </VStack>
            </Box>
            
            {/* Input Skeleton */}
            <Box p={4} borderTop="1px solid" borderColor={borderColor}>
              <Skeleton height="50px" width="100%" borderRadius="md" />
            </Box>
          </Container>
        </Box>
      </Layout>
    );
  }
  
  // Bot not found state
  if (!bot && !error) {
    return (
      <Layout hideNav={isMobile}>
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="100vh"
          bg={bgColor}
        >
          <Spinner size="xl" />
        </Box>
      </Layout>
    );
  }
  
  // Main chat return
  return (
    <Layout hideNav={isMobile}>
      <Box bg={bgColor} minH="100vh">
        <Container maxW={containerMaxW} px={0} h="100vh" display="flex" flexDirection="column">
          {/* Mobile back button and header */}
          <Flex 
            p={3} 
            borderBottom="1px solid" 
            borderColor={borderColor} 
            align="center"
            position="sticky"
            top={0}
            bg={headerBgColor}
            zIndex={10}
            h="60px"
          >
            {isMobile && (
              <IconButton
                icon={<FiArrowLeft />}
                variant="ghost"
                size="sm"
                mr={2}
                onClick={() => router.push('/chats')}
                aria-label="Back to chats"
              />
            )}
            
            <Avatar 
              src={bot?.avatar} 
              name={bot?.name} 
              size="sm" 
              mr={3} 
              bg={avatarBg}
            />
            
            <VStack align="start" spacing={0} flex="1">
              <Text fontWeight="bold" fontSize="sm">
                {bot?.name || "Chat"}
              </Text>
              <Text 
                fontSize="xs" 
                color="gray.500"
                noOfLines={1}
              >
                {bot?.description}
              </Text>
            </VStack>
            
            <Tooltip label="Bot Information">
              <IconButton
                icon={<FiInfo />}
                variant="ghost"
                size="sm"
                onClick={openDrawer}
                aria-label="Bot information"
              />
            </Tooltip>
          </Flex>
          
          {/* Error Alert */}
          {error && (
            <Alert status="error" mb={0}>
              <AlertIcon />
              <AlertTitle fontSize="sm">{error}</AlertTitle>
              <IconButton
                icon={<FiX />}
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                ml="auto"
                aria-label="Dismiss error"
              />
            </Alert>
          )}
          
          {/* Messages Container */}
          <Box 
            flex="1" 
            overflowY="auto" 
            py={4}
            px={{ base: 2, md: 4 }}
            id="messages-container"
          >
            {/* Empty State */}
            {messages.length === 0 && !isLoading ? (
              <VStack 
                justify="center" 
                align="center" 
                height="100%" 
                spacing={6}
                px={4}
              >
                <Avatar 
                  src={bot?.avatar} 
                  name={bot?.name} 
                  size="xl" 
                  bg={avatarBg}
                />
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="bold">
                    Chat with {bot?.name}
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    {bot?.description || "Ask me anything, and I'll assist you."}
                  </Text>
                </VStack>
                
                <Divider my={2} />
                
                <VStack spacing={3} width="100%" maxW="500px">
                  {['What can you help me with?', 'Tell me more about yourself', 'How does this work?'].map((suggestion, i) => (
                    <Button 
                      key={i}
                      variant="outline" 
                      size="sm"
                      width="full"
                      justifyContent="flex-start"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </VStack>
              </VStack>
            ) : (
              <VStack spacing={6} align="stretch" width="full">
                {/* Regular Messages */}
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    onCopy={handleCopy}
                    onRegenerate={handleRegenerate}
                    onSpeak={handleSpeak}
                    onImageGenerated={handleImageGenerated}
                    bot={bot}
                    localImages={messagesWithImages}
                  />
                ))}
                
                {/* Streaming Message */}
                {streamingMessage && (
                  <ChatMessage
                    message={streamingMessage}
                    onCopy={() => {}}
                    onRegenerate={() => {}}
                    onSpeak={() => {}}
                    bot={bot}
                    isStreaming={true}
                  />
                )}
                
                {/* Loading Indicator */}
                {isLoading && !streamingMessage && (
                  <HStack 
                    align="flex-start" 
                    spacing={3}
                    pl={2}
                  >
                    <Avatar 
                      src={bot?.avatar} 
                      name={bot?.name} 
                      size="sm" 
                      bg={avatarBg}
                    />
                    <VStack align="flex-start" spacing={1} pt={1}>
                      <Spinner size="sm" />
                      <Text fontSize="xs" color="gray.500">
                        Thinking...
                      </Text>
                    </VStack>
                  </HStack>
                )}
                
                {/* Scroll Anchor */}
                <Box ref={messagesEndRef} />
              </VStack>
            )}
          </Box>
          
          {/* Chat Input */}
          <Box 
            p={{ base: 2, md: 3 }} 
            borderTop="1px solid" 
            borderColor={borderColor}
            bg={bgColor}
          >
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              tokenUsage={tokenUsage}
              isStreaming={!!streamingMessage}
              onCancelStreaming={() => setStreamingMessage(null)}
            />
          </Box>
        </Container>
      </Box>
      
      {/* Bot Information Drawer (Mobile) */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={closeDrawer}
        size={isMobile ? "full" : "md"}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            Bot Information
          </DrawerHeader>
          
          <DrawerBody py={4}>
            <VStack spacing={6} align="center">
              <Avatar 
                src={bot?.avatar} 
                name={bot?.name} 
                size="xl" 
                bg={avatarBg}
              />
              
              <VStack spacing={2}>
                <Text fontSize="xl" fontWeight="bold">
                  {bot?.name}
                </Text>
                <Text color="gray.500" textAlign="center">
                  {bot?.description}
                </Text>
              </VStack>
              
              {bot?.capabilities && (
                <>
                  <Divider />
                  <Text fontWeight="bold" alignSelf="flex-start">
                    Capabilities
                  </Text>
                  <VStack align="stretch" width="full" spacing={2}>
                    {bot.capabilities.map((capability, i) => (
                      <HStack key={i} alignItems="flex-start">
                        <Box w="24px" textAlign="center">•</Box>
                        <Text flex="1">{capability}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Layout>
  );
}

export default withAuth(Chat);