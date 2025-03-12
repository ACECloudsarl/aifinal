// pages/chat/[botId].js - FIXED VERSION
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useSession } from 'next-auth/react';
import withAuth from '../../lib/withAuth';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/joy';
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
  
  const messagesEndRef = useRef(null);
  
  // Initialization effect - this runs first to set up the chat
  // Update the initialization logic to better handle missing bots
useEffect(() => {
    const initializeChat = async () => {
      try {
        setIsInitializing(true);
        setError(null);
        
        // Case 1: Direct navigation to a specific chat - use chatId from URL
        if (urlChatId) {
          console.log("Loading existing chat:", urlChatId);
          setChatId(urlChatId);
          
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
        else if (urlBotId) {
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
    if ((urlChatId || urlBotId) && session) {
      initializeChat();
    }
  }, [urlChatId, urlBotId, session, router]);
  
  
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
  }, [messages]);
  
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

  const handleImageGenerated = async (messageId, prompt, imageData, index) => {
    try {
      // Update the messages in state to remove the image tags
      setMessages(prevMessages => 
        prevMessages.map(msg => {
          if (msg.id === messageId) {
            // Clean content of image tags
            const cleanedContent = msg.content.replace(/\[\!\|(.*?)\|\!\]/g, '').trim();
            
            // Create/update metadata with image information
            const imagePrompts = msg.imagePrompts || [];
            const imageDataArray = msg.imageDataArray || [];
            
            if (!imagePrompts.includes(prompt)) {
              imagePrompts.push(prompt);
              imageDataArray.push(imageData);
            } else {
              // Replace existing image at that index
              const existingIndex = imagePrompts.indexOf(prompt);
              if (existingIndex >= 0) {
                imageDataArray[existingIndex] = imageData;
              }
            }
            
            return {
              ...msg,
              content: cleanedContent,
              imagePrompts,
              imageDataArray
            };
          }
          return msg;
        })
      );
    } catch (error) {
      console.error("Error storing generated image:", error);
    }
  };
  
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
  
  if (isInitializing) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  if (!bot && !error) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {bot && (
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Avatar
              src={bot.avatar}
              alt={bot.name}
            />
            <Box>
              <Typography level="title-md">{bot.name}</Typography>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                {bot.description}
              </Typography>
            </Box>
          </Box>
        )}
        
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {messages.length === 0 && !isLoading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}
            >
              <Typography level="body-lg" sx={{ mb: 2 }}>
                {t('chat.start_conversation')}
              </Typography>
              <Typography level="body-sm">
                {t('chat.example_prompts')}
              </Typography>
            </Box>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onCopy={handleCopy}
                onRegenerate={handleRegenerate}
                onSpeak={handleSpeak}
                onImageGenerated={handleImageGenerated}
                bot={bot}
              />
            ))
          )}
          
          {streamingMessage && (
            <ChatMessage
              message={streamingMessage}
              onCopy={() => {}}
              onRegenerate={() => {}}
              onSpeak={() => {}}
              bot={bot}
            />
          )}
          
          {isLoading && !streamingMessage && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
              }}
            >
              <Avatar
                src={bot?.avatar}
                alt={bot?.name}
                size="sm"
              />
              <CircularProgress size="sm" />
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
        
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          tokenUsage={tokenUsage}
        />
      </Box>
    </Layout>
  );
}

export default withAuth(Chat);