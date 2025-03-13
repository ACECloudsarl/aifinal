// components/chat/ChatInput.js
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Textarea,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Snackbar,
} from '@mui/joy';
import {
  Send,
  Paperclip,
  StopCircle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import VoiceRecorder from './VoiceRecorder';
import voiceService from '@/lib/VoiceService';

const ChatInput = ({ onSendMessage, isLoading, onCancelStreaming, tokenUsage = { used: 0, total: 4000 }, isStreaming }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [autoTTS, setAutoTTS] = useState(false);
  const textareaRef = useRef(null);
  
  // Load voice settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await voiceService.loadUserSettings();
      if (settings) {
        setAutoTTS(settings.autoTTS);
      }
    };
    
    loadSettings();
  }, []);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  // Handle voice recording
  const handleVoiceRecorded = (transcription) => {
    if (transcription && transcription.trim()) {
      setMessage(transcription);
      // Optional: Auto-send after voice input
      // setTimeout(() => {
      //   if (transcription.trim()) {
      //     onSendMessage(transcription);
      //     setMessage('');
      //   }
      // }, 500);
    }
  };
  
  // Toggle auto TTS
  const toggleAutoTTS = async () => {
    try {
      const isEnabled = await voiceService.toggleAutoTTS();
      setAutoTTS(isEnabled);
    } catch (error) {
      setError('Failed to toggle auto TTS');
    }
  };
  
  // Calculate token usage percentage
  const usagePercentage = Math.min((tokenUsage.used / tokenUsage.total) * 100, 100);
  const usageColor = usagePercentage > 80 ? 'danger' : usagePercentage > 60 ? 'warning' : 'success';
  
  return (
    <>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          backgroundColor: 'background.surface',
          borderTop: '1px solid',
          borderColor: 'divider',
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 1,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title={t('chat.attachment')}>
                  <IconButton 
                    size="sm" 
                    variant="plain" 
                    color="neutral"
                    component="label"
                  >
                    <input type="file" hidden />
                    <Paperclip size={18} />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={autoTTS ? t('chat.disable_tts') : t('chat.enable_tts')}>
                  <IconButton 
                    size="sm" 
                    variant="plain"
                    color={autoTTS ? "primary" : "neutral"}
                    onClick={toggleAutoTTS}
                  >
                    {autoTTS ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </IconButton>
                </Tooltip>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CircularProgress
                    determinate
                    size="sm"
                    thickness={2}
                    value={usagePercentage}
                    color={usageColor}
                    sx={{ fontSize: '0.75rem' }}
                  />
                  <Tooltip title={t('chat.token_usage')}>
                    <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {Math.round(tokenUsage.used)}/{tokenUsage.total}
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
              
              <VoiceRecorder onVoiceRecorded={handleVoiceRecorded} />
            </Box>
            
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 1,
                bgcolor: 'background.level1',
                borderRadius: 'lg',
                p: 1,
                boxShadow: 'sm',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('chat.placeholder')}
                minRows={1}
                maxRows={4}
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
                  boxShadow: 'none',
                  p: 1,
                  '&:focus': {
                    outline: 'none',
                    boxShadow: 'none',
                  },
                  '&::before': {
                    display: 'none',
                  },
                  '&:hover': {
                    bgcolor: 'transparent',
                  },
                  fontSize: '0.9rem',
                }}
              />
              
              {isStreaming ? (
                <Button
                  color="danger"
                  variant="soft"
                  size="sm"
                  onClick={onCancelStreaming}
                  startDecorator={<StopCircle size={16} />}
                  sx={{ height: 36, borderRadius: 'md' }}
                >
                  {t('chat.stop')}
                </Button>
              ) : (
                <IconButton
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  color="primary"
                  size="sm"
                  sx={{ 
                    borderRadius: '50%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size="sm" />
                  ) : (
                    <Send size={18} />
                  )}
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Snackbar
        open={!!error}
        onClose={() => setError('')}
        color="danger"
        variant="soft"
        autoHideDuration={5000}
      >
        {error}
      </Snackbar>
    </>
  );
};

export default ChatInput;