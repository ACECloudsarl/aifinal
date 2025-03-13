// components/chat/ChatMessage.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Sheet,
  Tooltip,
  AspectRatio,
} from '@mui/joy';
import {
  Copy,
  RefreshCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import ImageDisplay from './ImageDisplay';
import voiceService from '@/lib/VoiceService';

const ChatMessage = ({ message, onCopy, onRegenerate, bot }) => {
  const { t } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);
  const [isMessageSpeaking, setIsMessageSpeaking] = useState(false);
  const [autoTTSEnabled, setAutoTTSEnabled] = useState(false);
  const isUser = message.role === 'user';
  
  // Parse content for image tags - but only for assistant messages
  const [textContent, imageTags] = isUser 
    ? [message.content, []] // For user messages, don't parse for image tags
    : parseContentForImageTags(message.content); // Only parse assistant messages
  
  // Check for stored images in metadata
  const hasStoredImages = message.metadata && (
    (Array.isArray(message.metadata.imageUrls) && message.metadata.imageUrls.length > 0) ||
    (Array.isArray(message.metadata.imageData) && message.metadata.imageData.length > 0)
  );
  
  // Check RTL and load voice settings on mount
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      setIsRTL(document.dir === 'rtl');
      
      // Load voice settings
      const loadSettings = async () => {
        const settings = await voiceService.loadUserSettings();
        if (settings) {
          setAutoTTSEnabled(settings.autoTTS);
        }
      };
      
      loadSettings();
    }
    
    // Subscribe to voice service playing events
    const unsubscribePlaying = voiceService.subscribeToPlaying(() => {
      if (isMessageSpeaking) {
        setIsMessageSpeaking(true);
      }
    });
    
    // Subscribe to voice service stopped events
    const unsubscribeStopped = voiceService.subscribeToStopped(() => {
      setIsMessageSpeaking(false);
    });
    
    return () => {
      // Clean up subscriptions
      unsubscribePlaying();
      unsubscribeStopped();
    };
  }, []);
  
  // Auto-speak assistant messages if auto TTS is enabled
  useEffect(() => {
    const autoSpeak = async () => {
      // Only auto-speak assistant messages, not temporary messages, and only if not already speaking
      if (
        !isUser && 
        autoTTSEnabled && 
        !message.id.startsWith('temp-') && 
        !isMessageSpeaking
      ) {
        // Don't auto-speak messages with images
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
    
    // Find all image tags
    while ((match = regex.exec(content)) !== null) {
      imageTags.push(match[1].trim());
    }
    
    // Remove image tags from content
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
    
    // Use bot's voice ID if available
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
      sx={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 1.5,
        mb: 3,
      }}
    >
      <Avatar
        src={isUser ? "/images/user-avatar.png" : bot?.avatar}
        alt={isUser ? "User" : bot?.name}
        size="sm"
      />
      
      <Box sx={{ maxWidth: '80%' }}>
        <Typography
          level="body-xs"
          sx={{
            mb: 0.5,
            textAlign: isUser ? 'right' : 'left',
            color: 'text.secondary',
          }}
        >
          {isUser ? "You" : bot?.name}
        </Typography>
        
        <Sheet
          variant="soft"
          color={isUser ? "primary" : "neutral"}
          sx={{
            p: 2,
            borderRadius: '16px',
            borderTopRightRadius: isUser && !isRTL ? '4px' : '16px',
            borderTopLeftRadius: isUser && isRTL ? '4px' : '16px',
            borderBottomLeftRadius: !isUser && !isRTL ? '4px' : '16px',
            borderBottomRightRadius: !isUser && isRTL ? '4px' : '16px',
            wordBreak: 'break-word',
          }}
        >
          <Typography>
            {hasStoredImages ? message.content : textContent}
          </Typography>
          
          {/* Case 1: Permanent message with stored image URLs */}
          {message.metadata && message.metadata.imagePrompts && message.metadata.imageUrls && 
            message.metadata.imagePrompts.map((prompt, index) => (
              <Box key={`stored-${message.id}-${index}`} sx={{ my: 2 }}>
                <AspectRatio 
                  ratio="1/1" 
                  objectFit="cover" 
                  sx={{ 
                    borderRadius: 'md',
                    maxWidth: 400
                  }}
                >
                  <img
                    src={message.metadata.imageUrls[index]}
                    alt={prompt}
                    loading="lazy"
                  />
                </AspectRatio>
              </Box>
            ))
          }
          
          {/* Case 2: Legacy messages with base64 data */}
          {message.metadata && message.metadata.imageData && !message.metadata.imageUrls && 
            message.metadata.imageData.map((base64Data, index) => (
              <Box key={`legacy-${message.id}-${index}`} sx={{ my: 2 }}>
                <AspectRatio 
                  ratio="1/1" 
                  objectFit="cover" 
                  sx={{ 
                    borderRadius: 'md',
                    maxWidth: 400
                  }}
                >
                  <img
                    src={`data:image/png;base64,${base64Data}`}
                    alt={message.metadata.imagePrompts?.[index] || "AI generated image"}
                    loading="lazy"
                  />
                </AspectRatio>
              </Box>
            ))
          }
          
          {/* Case 3: New images using the ImageDisplay component */}
          {!hasStoredImages && imageTags.map((prompt, index) => (
            <ImageDisplay
              key={`display-${prompt.substring(0, 20)}`}
              prompt={prompt}
              messageId={message.id}
            />
          ))}
        </Sheet>

        {!isUser && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: 0.5,
              mt: 0.5,
            }}
          >
            <Tooltip title={t('chat.copy')}>
              <IconButton
                variant="plain"
                color="neutral"
                size="sm"
                onClick={() => onCopy(hasStoredImages ? message.content : textContent)}
              >
                <Copy size={16} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={t('chat.regenerate')}>
              <IconButton
                variant="plain"
                color="neutral"
                size="sm"
                onClick={() => onRegenerate(message.id)}
              >
                <RefreshCw size={16} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isMessageSpeaking ? t('chat.stop_speaking') : t('chat.speak')}>
              <IconButton
                variant="plain"
                color={isMessageSpeaking ? "primary" : "neutral"}
                size="sm"
                onClick={handleSpeak}
              >
                {isMessageSpeaking ? (
                  <VolumeX size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage;