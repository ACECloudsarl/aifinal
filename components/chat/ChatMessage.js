// components/chat/ChatMessage.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Avatar, 
  IconButton, 
  Tooltip, 
  VStack, 
  HStack, 
  Image,
  useColorModeValue 
} from '@chakra-ui/react';
import { 
  FiCopy, 
  FiRefreshCw, 
  FiVolume2, 
  FiVolumeX 
} from 'react-icons/fi';
import ImageDisplay from './ImageDisplay';
import voiceService from '@/lib/VoiceService';

const ChatMessage = ({ message, onCopy, onRegenerate, bot }) => {
  const [isRTL, setIsRTL] = useState(false);
  const [isMessageSpeaking, setIsMessageSpeaking] = useState(false);
  const [autoTTSEnabled, setAutoTTSEnabled] = useState(false);
  
  const isUser = message.role === 'user';
  
  // Parse content for image tags
  const [textContent, imageTags] = isUser 
    ? [message.content, []] 
    : parseContentForImageTags(message.content);
  
  // Check for stored images in metadata
  const hasStoredImages = message.metadata && (
    (Array.isArray(message.metadata.imageUrls) && message.metadata.imageUrls.length > 0) ||
    (Array.isArray(message.metadata.imageData) && message.metadata.imageData.length > 0)
  );
  
  // Background and text colors based on user/bot message
  const bgColor = useColorModeValue(
    isUser ? 'blue.50' : 'gray.100', 
    isUser ? 'blue.900' : 'gray.700'
  );
  const textColor = useColorModeValue(
    isUser ? 'gray.800' : 'gray.900',
    isUser ? 'gray.100' : 'gray.100'
  );
  
  // Check RTL and load voice settings on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsRTL(document.dir === 'rtl');
      
      const loadSettings = async () => {
        const settings = await voiceService.loadUserSettings();
        if (settings) {
          setAutoTTSEnabled(settings.autoTTS);
        }
      };
      
      loadSettings();
    }
    
    // Subscribe to voice service events
    const unsubscribePlaying = voiceService.subscribeToPlaying(() => {
      if (isMessageSpeaking) {
        setIsMessageSpeaking(true);
      }
    });
    
    const unsubscribeStopped = voiceService.subscribeToStopped(() => {
      setIsMessageSpeaking(false);
    });
    
    return () => {
      unsubscribePlaying();
      unsubscribeStopped();
    };
  }, []);
  
  // Auto-speak assistant messages if auto TTS is enabled
  useEffect(() => {
    const autoSpeak = async () => {
      if (
        !isUser && 
        autoTTSEnabled && 
        !message.id.startsWith('temp-') && 
        !isMessageSpeaking
      ) {
        if (!hasStoredImages && imageTags.length === 0) {
          handleSpeak();
        }
      }
    };
    
    autoSpeak();
  }, [autoTTSEnabled, message.id, isUser, hasStoredImages, imageTags.length]);
  
  // Function to parse image tags
  function parseContentForImageTags(content) {
    if (!content) return [content, []];
    
    const regex = /\[\!\|(.*?)\|\!\]/g;
    const imageTags = [];
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      imageTags.push(match[1].trim());
    }
    
    const cleanedContent = content.replace(regex, '');
    
    return [cleanedContent, imageTags];
  }
  
  // Handle text-to-speech
  const handleSpeak = async () => {
    if (isMessageSpeaking) {
      voiceService.stopAudio();
      setIsMessageSpeaking(false);
      return;
    }
    
    const contentToSpeak = hasStoredImages ? message.content : textContent;
    const voiceId = bot?.voiceId;
    
    try {
      setIsMessageSpeaking(true);
      await voiceService.speak(contentToSpeak, voiceId);
    } catch (error) {
      console.error('Error speaking message:', error);
      setIsMessageSpeaking(false);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection={isUser ? 'row-reverse' : 'row'}
      gap={3}
      mb={4}
      alignItems="flex-start"
    >
      <Avatar
        src={isUser ? "/images/user-avatar.png" : bot?.avatar}
        name={isUser ? "User" : bot?.name}
        size="sm"
      />
      
      <VStack align="stretch" maxWidth="80%">
        <Text
          fontSize="xs"
          textAlign={isUser ? 'right' : 'left'}
          color="gray.500"
        >
          {isUser ? "You" : bot?.name}
        </Text>
        
        <Box
          bg={bgColor}
          color={textColor}
          p={3}
          borderRadius="lg"
          borderTopRightRadius={isUser ? "none" : "lg"}
          borderTopLeftRadius={isUser ? "lg" : "none"}
        >
          <Text>{hasStoredImages ? message.content : textContent}</Text>
          
          {/* Stored Image URLs */}
          {message.metadata?.imageUrls?.map((url, index) => (
            <Image
              key={`stored-${message.id}-${index}`}
              src={url}
              alt={message.metadata.imagePrompts?.[index] || "AI generated image"}
              borderRadius="md"
              mt={2}
              maxWidth="400px"
            />
          ))}
          
          {/* Legacy Base64 Images */}
          {message.metadata?.imageData?.map((base64Data, index) => (
            <Image
              key={`legacy-${message.id}-${index}`}
              src={`data:image/png;base64,${base64Data}`}
              alt={message.metadata.imagePrompts?.[index] || "AI generated image"}
              borderRadius="md"
              mt={2}
              maxWidth="400px"
            />
          ))}
          
          {/* New Images via ImageDisplay */}
          {!hasStoredImages && imageTags.map((prompt, index) => (
            <ImageDisplay
              key={`display-${prompt.substring(0, 20)}`}
              prompt={prompt}
              messageId={message.id}
            />
          ))}
        </Box>

        {!isUser && (
          <HStack justify="flex-start" spacing={1} mt={1}>
            <Tooltip label="Copy">
              <IconButton
                icon={<FiCopy />}
                size="xs"
                variant="ghost"
                onClick={() => onCopy(hasStoredImages ? message.content : textContent)}
              />
            </Tooltip>
            
            <Tooltip label="Regenerate">
              <IconButton
                icon={<FiRefreshCw />}
                size="xs"
                variant="ghost"
                onClick={() => onRegenerate(message.id)}
              />
            </Tooltip>
            
            <Tooltip label={isMessageSpeaking ? "Stop Speaking" : "Speak"}>
              <IconButton
                icon={isMessageSpeaking ? <FiVolumeX /> : <FiVolume2 />}
                size="xs"
                variant="ghost"
                colorScheme={isMessageSpeaking ? "red" : "blue"}
                onClick={handleSpeak}
              />
            </Tooltip>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default ChatMessage;