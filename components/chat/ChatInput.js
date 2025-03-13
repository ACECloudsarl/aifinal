// components/chat/ChatInput.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Textarea, 
  IconButton, 
  Button, 
  Tooltip, 
  Progress, 
  useToast,
  HStack,
  VStack,
  Avatar
} from '@chakra-ui/react';
import { 
  FiSend, 
  FiPaperclip, 
  FiStopCircle, 
  FiVolume2, 
  FiVolumeX 
} from 'react-icons/fi';
import VoiceRecorder from './VoiceRecorder';
import voiceService from '@/lib/VoiceService';

const ChatInput = ({ 
  onSendMessage, 
  isLoading, 
  onCancelStreaming, 
  tokenUsage = { used: 0, total: 4000 }, 
  isStreaming 
}) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [autoTTS, setAutoTTS] = useState(false);
  const textareaRef = useRef(null);
  const toast = useToast();
  
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
    }
  };
  
  // Toggle auto TTS
  const toggleAutoTTS = async () => {
    try {
      const isEnabled = await voiceService.toggleAutoTTS();
      setAutoTTS(isEnabled);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to toggle auto TTS',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Calculate token usage percentage
  const usagePercentage = Math.min((tokenUsage.used / tokenUsage.total) * 100, 100);
  const usageColor = usagePercentage > 80 ? 'red' : usagePercentage > 60 ? 'orange' : 'green';
  
  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      position="sticky"
      bottom={0}
      left={0}
      right={0}
      p={2}
      bg="white"
      borderTop="1px solid"
      borderColor="gray.200"
      zIndex={10}
    >
      <VStack spacing={2} align="stretch">
        <HStack 
          spacing={2} 
          align="center" 
          justify="space-between"
          px={1}
        >
          <HStack spacing={2} align="center">
            <Tooltip label="Attachment">
              <IconButton 
                icon={<FiPaperclip />} 
                variant="ghost"
                size="sm"
                as="label"
              >
                <input type="file" hidden />
              </IconButton>
            </Tooltip>
            
            <Tooltip label={autoTTS ? "Disable TTS" : "Enable TTS"}>
              <IconButton 
                icon={autoTTS ? <FiVolume2 /> : <FiVolumeX />}
                variant="ghost"
                size="sm"
                colorScheme={autoTTS ? "blue" : "gray"}
                onClick={toggleAutoTTS}
              />
            </Tooltip>
            
            <HStack spacing={1} align="center">
              <Progress
                value={usagePercentage}
                size="sm"
                colorScheme={usageColor}
                width="100px"
              />
              <Tooltip label="Token Usage">
                <Box fontSize="xs" color="gray.500">
                  {Math.round(tokenUsage.used)}/{tokenUsage.total}
                </Box>
              </Tooltip>
            </HStack>
          </HStack>
          
          <VoiceRecorder onVoiceRecorded={handleVoiceRecorded} />
        </HStack>
        
        <Box 
          bg="gray.50" 
          borderRadius="xl" 
          p={2} 
          boxShadow="sm"
          border="1px solid"
          borderColor="gray.200"
        >
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            minHeight="40px"
            maxHeight="120px"
            resize="none"
            variant="unstyled"
            px={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          
          <HStack justify="flex-end" mt={2}>
            {isStreaming ? (
              <Button
                colorScheme="red"
                variant="outline"
                size="sm"
                leftIcon={<FiStopCircle />}
                onClick={onCancelStreaming}
              >
                Stop
              </Button>
            ) : (
              <IconButton
                type="submit"
                isDisabled={!message.trim() || isLoading}
                colorScheme="blue"
                size="sm"
                icon={isLoading ? <Progress size="sm" isIndeterminate /> : <FiSend />}
              />
            )}
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ChatInput;