// components/chat/ChatInput.js (updated to support streaming)
import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Textarea,
  IconButton,
  Button,
  CircularProgress,
  Tooltip,
  Typography
} from '@mui/joy';
import {
  Send,
  Paperclip,
  BarChart2,
  StopCircle,
} from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';

const ChatInput = ({ onSendMessage, isLoading, onCancelStreaming, tokenUsage = { used: 0, total: 4000 }, isStreaming }) => {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  const handleVoiceRecorded = async (audioBlob) => {
    // In a real app, you'd send this to a speech-to-text API
    // For now we'll just mock it with a placeholder message
    onSendMessage("Voice message transcription would appear here");
  };
  
  const usagePercentage = (tokenUsage.used / tokenUsage.total) * 100;
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: 'sticky',
        bottom: 0,
        left: 0,
        right: 0,
        p: 2,
        backgroundColor: 'var(--joy-palette-background-surface)',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: 10,
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: 1,
        backgroundColor: 'var(--joy-palette-background-level1)',
        borderRadius: 'lg',
        p: 1,
      }}>
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('chat.placeholder')}
          minRows={1}
          maxRows={5}
          onKeyDown={(e) => {
            // Submit on Enter (but not with Shift+Enter)
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          sx={{
            flex: 1,
            border: 'none',
            '&:focus': {
              outline: 'none',
              ring: 0,
            },
            '&::before': {
              display: 'none',
            },
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={t('chat.tokens')}>
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <CircularProgress
                determinate
                value={usagePercentage}
                size="sm"
                thickness={2}
                sx={{ 
                  color: usagePercentage > 80 
                    ? 'danger.500' 
                    : usagePercentage > 60 
                      ? 'warning.500' 
                      : 'success.500',
                }}
              />
              <Typography 
                level="body-xs" 
                sx={{ ml: 0.5, color: 'text.secondary' }}
              >
                {tokenUsage.used}/{tokenUsage.total}
              </Typography>
            </Box>
          </Tooltip>
          
          <Tooltip title={t('chat.attachment')}>
            <IconButton color="neutral" variant="plain" component="label">
              <input type="file" hidden />
              <Paperclip size={20} />
            </IconButton>
          </Tooltip>
          
          <VoiceRecorder onVoiceRecorded={handleVoiceRecorded} />
          
          {isStreaming ? (
            <Button
              color="danger"
              variant="soft"
              onClick={onCancelStreaming}
              startDecorator={<StopCircle size={18} />}
            >
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              color="primary"
              disabled={!message.trim() || isLoading}
              loading={isLoading && !isStreaming}
              sx={{ borderRadius: '50%', width: 40, height: 40, minWidth: 'auto', p: 0 }}
            >
              <Send size={18} />
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInput;