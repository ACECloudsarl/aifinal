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
} from '@mui/joy';
import {
  Copy,
  RefreshCw,
  Volume2,
} from 'lucide-react';
import ImageGenerator from './ImageGenerator';

// Add onImageGenerated to the props
const ChatMessage = ({ message, onCopy, onRegenerate, onSpeak, onImageGenerated, bot }) => {
  const { t } = useTranslation();
  const [isRTL, setIsRTL] = useState(false);
  const isUser = message.role === 'user';
  
  // Parse content for image tags - but only for assistant messages
  const [textContent, imageTags] = isUser 
    ? [message.content, []] // For user messages, don't parse for image tags
    : parseContentForImageTags(message.content); // Only parse assistant messages
  
  // Check if this message has stored generated images
  const hasStoredImages = message.metadata && Array.isArray(message.metadata.imagePrompts) && message.metadata.imagePrompts.length > 0;
  
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      setIsRTL(document.dir === 'rtl');
    }
  }, []);
  
  // Function to parse [!|image description|!] tags
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
          
          {/* For messages with stored images in metadata */}
          {hasStoredImages && message.metadata.imagePrompts.map((prompt, index) => (
            <ImageGenerator 
              key={`stored-${index}`}
              prompt={prompt}
              imageData={message.metadata.imageData?.[index]}
              messageId={message.id}
              storedImage={true}
              index={index}
            />
          ))}
          
          {/* For new images detected in the message that haven't been stored yet */}
          {!hasStoredImages && imageTags.map((prompt, index) => (
            <ImageGenerator 
              key={`new-${index}`}
              prompt={prompt}
              messageId={message.id}
              storedImage={false}
              index={index}
              onImageGenerated={onImageGenerated}
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
            
            <Tooltip title={t('chat.speak')}>
              <IconButton
                variant="plain"
                color="neutral"
                size="sm"
                onClick={() => onSpeak(hasStoredImages ? message.content : textContent)}
              >
                <Volume2 size={16} />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage;