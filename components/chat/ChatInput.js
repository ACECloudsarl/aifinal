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
  Avatar,
  useColorModeValue,
  InputGroup,
  InputRightElement,
  Text,
  Flex,
  Portal,
  Collapse,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Tag,
  TagLabel,
  TagLeftIcon,
  Divider
} from '@chakra-ui/react';
import { 
  FiSend, 
  FiPaperclip, 
  FiStopCircle, 
  FiVolume2, 
  FiVolumeX,
  FiImage,
  FiLink,
  FiInfo,
  FiCommand,
  FiHash,
  FiCode,
  FiSmile
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
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCommandsOpen, setIsCommandsOpen] = useState(false);
  const textareaRef = useRef(null);
  const toast = useToast();
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  
  // Suggestions for the user
  const suggestions = [
    "Generate an image of a sunset over mountains",
    "Explain how quantum computing works",
    "Write a short story about a robot learning to paint",
    "Can you help me debug this code?",
  ];
  
  // Available commands/shortcuts
  const commands = [
    { icon: FiImage, label: "Generate image", command: "/image" },
    { icon: FiCode, label: "Code block", command: "/code" },
    { icon: FiLink, label: "Add link", command: "/link" },
    { icon: FiHash, label: "List", command: "/list" },
  ];
  
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
      setShowSuggestions(false);
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
      
      toast({
        title: isEnabled ? 'Auto TTS Enabled' : 'Auto TTS Disabled',
        description: isEnabled ? 'Responses will be read aloud.' : 'Responses will not be read aloud.',
        status: isEnabled ? 'success' : 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
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
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    // Focus the textarea after selecting a suggestion
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Handle command insertion
  const handleCommandClick = (commandText) => {
    setMessage(prev => prev + commandText + ' ');
    setIsCommandsOpen(false);
    // Focus the textarea after inserting a command
    if (textareaRef.current) {
      textareaRef.current.focus();
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
      p={3}
      bg={useColorModeValue('white', 'gray.900')}
      borderTop="1px solid"
      borderColor={borderColor}
      zIndex={10}
      boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      borderBottomRadius="lg"
    >
      <VStack spacing={2} align="stretch">
        {/* Suggestions */}
        <Collapse in={showSuggestions && !isLoading && !message.trim()}>
          <Box 
            mb={2} 
            p={2} 
            bg={bgColor} 
            borderRadius="md" 
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.500">
              SUGGESTIONS
            </Text>
            <Flex wrap="wrap" gap={2}>
              {suggestions.map((suggestion, index) => (
                <Tag 
                  key={index} 
                  size="md" 
                  borderRadius="full" 
                  variant="subtle" 
                  colorScheme="blue" 
                  cursor="pointer"
                  _hover={{ bg: hoverBgColor }}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <TagLabel>{suggestion}</TagLabel>
                </Tag>
              ))}
            </Flex>
          </Box>
        </Collapse>
        
        {/* Controls & Settings */}
        <HStack 
          spacing={2} 
          align="center" 
          justify="space-between"
          px={1}
        >
          <HStack spacing={2} align="center">
            <Popover
              isOpen={isCommandsOpen}
              onClose={() => setIsCommandsOpen(false)}
              placement="top-start"
            >
              <PopoverTrigger>
                <IconButton 
                  icon={<FiCommand />} 
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCommandsOpen(!isCommandsOpen)}
                  aria-label="Commands"
                />
              </PopoverTrigger>
              <PopoverContent width="220px">
                <PopoverArrow />
                <PopoverBody p={2}>
                  <Text fontSize="xs" fontWeight="bold" mb={2} color="gray.500">
                    COMMANDS
                  </Text>
                  <VStack align="stretch" spacing={1}>
                    {commands.map((cmd, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="ghost"
                        justifyContent="flex-start"
                        leftIcon={<cmd.icon />}
                        onClick={() => handleCommandClick(cmd.command)}
                        w="full"
                      >
                        {cmd.label}
                      </Button>
                    ))}
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            
            <Tooltip label="Attachment">
              <IconButton 
                icon={<FiPaperclip />} 
                variant="ghost"
                size="sm"
                as="label"
                aria-label="Add attachment"
              >
                <input type="file" hidden />
              </IconButton>
            </Tooltip>
            
            <Tooltip label={autoTTS ? "Disable Text-to-Speech" : "Enable Text-to-Speech"}>
              <IconButton 
                icon={autoTTS ? <FiVolume2 /> : <FiVolumeX />}
                variant="ghost"
                size="sm"
                colorScheme={autoTTS ? "blue" : "gray"}
                onClick={toggleAutoTTS}
                aria-label={autoTTS ? "Disable TTS" : "Enable TTS"}
              />
            </Tooltip>
            
            <HStack spacing={1} align="center">
              <Progress
                value={usagePercentage}
                size="xs"
                colorScheme={usageColor}
                width="100px"
                borderRadius="full"
              />
              <Tooltip label="Token Usage">
                <Text fontSize="xs" color="gray.500">
                  {Math.round(tokenUsage.used)}/{tokenUsage.total}
                </Text>
              </Tooltip>
            </HStack>
          </HStack>
          
          <VoiceRecorder onVoiceRecorded={handleVoiceRecorded} />
        </HStack>
        
        {/* Main Textarea Input */}
        <Box 
          bg={bgColor} 
          borderRadius="xl" 
          p={2} 
          boxShadow="sm"
          border="1px solid"
          borderColor={borderColor}
          position="relative"
        >
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message or use / for commands..."
            minHeight="40px"
            maxHeight="120px"
            resize="none"
            variant="unstyled"
            px={2}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
              // Open commands menu on slash
              if (e.key === '/' && message === '') {
                setIsCommandsOpen(true);
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
                icon={<FiSend />}
                isLoading={isLoading}
                aria-label="Send message"
              />
            )}
          </HStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default ChatInput;