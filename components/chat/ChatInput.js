// components/chat/ChatInput.js - Redesigned with floating buttons
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
  useColorModeValue,
  Flex,
  Collapse,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  Text,
  Tag,
  TagLabel,
  useBreakpointValue,
  Divider,
  Circle,
  Spinner,
} from '@chakra-ui/react';
import { 
  FiSend, 
  FiPaperclip, 
  FiStopCircle, 
  FiVolume2, 
  FiVolumeX,
  FiImage,
  FiCommand,
  FiMoreHorizontal,
  FiMic,
  FiArrowRight,
  FiInfo,
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
  const [autoTTS, setAutoTTS] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCommandsOpen, setIsCommandsOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const recordButtonRef = useRef(null);
  const recordTimeoutRef = useRef(null);
  const toast = useToast();
  
  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const bgColor = useColorModeValue('white', 'gray.900');
  const inputBgColor = useColorModeValue('gray.50', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const buttonShadow = useColorModeValue('0 2px 6px rgba(0,0,0,0.1)', '0 2px 6px rgba(0,0,0,0.4)');
  const tokenBgColor = useColorModeValue('gray.100', 'gray.700');
  
  // Suggestions for the user
  const suggestions = [
    "Generate an image of a sunset over mountains",
    "Explain how quantum computing works",
    "Write a short story about a robot learning to paint",
    "Analyze this data and create a chart"
  ];
  
  // Available commands/shortcuts
  const commands = [
    { icon: FiImage, label: "Generate image", command: "/image" },
    { icon: FiInfo, label: "Explain this", command: "/explain" },
  ];
  
  // Load voice settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await voiceService.loadUserSettings();
        if (settings) {
          setAutoTTS(settings.autoTTS);
        }
      } catch (error) {
        console.error("Error loading voice settings:", error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);
  
  // Handle message submission
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
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
    setIsRecording(false);
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
  
  // Start voice recording with long press
  const startRecording = () => {
    recordTimeoutRef.current = setTimeout(() => {
      setIsRecording(true);
    }, 500); // 500ms delay for long press
  };
  
  // Cancel recording if button released too quickly
  const cancelRecording = () => {
    if (recordTimeoutRef.current) {
      clearTimeout(recordTimeoutRef.current);
    }
  };
  
  // Calculate token usage percentage
  const usagePercentage = Math.min((tokenUsage.used / tokenUsage.total) * 100, 100);
  const usageColor = usagePercentage > 80 ? 'red' : usagePercentage > 60 ? 'orange' : 'green';
  
  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      position="relative"
      pb={2}
    >
      {/* Token Usage Badge - Now at the top */}
      <Flex 
        justify="center" 
        mb={2}
        opacity={0.8}
      >
        <Box 
          px={3} 
          py={1} 
          borderRadius="full" 
          bg={tokenBgColor} 
          fontSize="xs"
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Text fontWeight="medium">Tokens:</Text>
          <Progress
            value={usagePercentage}
            size="xs"
            colorScheme={usageColor}
            width="80px"
            borderRadius="full"
          />
          <Text>
            {Math.round(tokenUsage.used)}/{tokenUsage.total}
          </Text>
        </Box>
      </Flex>
      
      {/* Suggestions */}
      <Collapse in={showSuggestions && !isLoading && !message.trim()}>
        <Box 
          mb={2} 
          p={2} 
          bg={bgColor} 
          borderRadius="md" 
          borderWidth="1px" 
          borderColor={borderColor}
          boxShadow="sm"
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
                <TagLabel noOfLines={1}>
                  {suggestion}
                </TagLabel>
              </Tag>
            ))}
          </Flex>
        </Box>
      </Collapse>
      
      {/* Input Area with Floating Buttons */}
      <Box position="relative">
        {/* Main Input Box */}
        <Box 
          bg={inputBgColor} 
          borderRadius="full" 
          borderWidth="1px"
          borderColor={borderColor}
          transition="all 0.2s"
          pr={16} // Leave space for the floating buttons
          _focus-within={{
            borderColor: "blue.400",
            boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
          }}
        >
          {/* Left side controls */}
          <HStack spacing={1} position="absolute" left={2} top="50%" transform="translateY(-50%)" zIndex={2}>
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
            
            <Popover>
              <PopoverTrigger>
                <IconButton 
                  icon={<FiMoreHorizontal />} 
                  variant="ghost"
                  size="sm"
                  aria-label="More options"
                />
              </PopoverTrigger>
              <PopoverContent width="200px">
                <PopoverArrow />
                <PopoverBody p={2}>
                  <VStack align="stretch" spacing={2}>
                    <Button
                      size="sm"
                      variant="ghost"
                      justifyContent="flex-start"
                      leftIcon={autoTTS ? <FiVolume2 /> : <FiVolumeX />}
                      onClick={toggleAutoTTS}
                    >
                      {autoTTS ? "Disable" : "Enable"} Text-to-Speech
                    </Button>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          </HStack>
          
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message..."
            minHeight="24px"
            maxHeight="150px"
            resize="none"
            px={12}
            py={3}
            border="none"
            borderRadius="full"
            _focus={{ 
              border: "none", 
              boxShadow: "none" 
            }}
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
        </Box>
        
        {/* Floating Send Button */}
        <Circle
          size="44px"
          bg="blue.500"
          color="white"
          position="absolute"
          right={0}
          top="50%"
          transform="translateY(-50%)"
          boxShadow={buttonShadow}
          cursor="pointer"
          _hover={{ bg: "blue.600" }}
          onClick={handleSubmit}
          display={isStreaming ? "none" : "flex"}
          zIndex={3}
        >
          {isLoading ? (
            <Spinner size="sm" color="white" />
          ) : (
            <FiSend size={18} />
          )}
        </Circle>
        
        {/* Stop Streaming Button (replaces send when streaming) */}
        {isStreaming && (
          <Circle
            size="44px"
            bg="red.500"
            color="white"
            position="absolute"
            right={0}
            top="50%"
            transform="translateY(-50%)"
            boxShadow={buttonShadow}
            cursor="pointer"
            _hover={{ bg: "red.600" }}
            onClick={onCancelStreaming}
            zIndex={3}
          >
            <FiStopCircle size={20} />
          </Circle>
        )}
        
        {/* Floating Record Button */}
        <Circle
          ref={recordButtonRef}
          size="44px"
          bg={isRecording ? "red.500" : "gray.400"}
          color="white"
          position="absolute"
          right={50}
          top="50%"
          transform="translateY(-50%)"
          boxShadow={buttonShadow}
          cursor="pointer"
          _hover={{ bg: isRecording ? "red.600" : "gray.500" }}
          onMouseDown={startRecording}
          onMouseUp={cancelRecording}
          onTouchStart={startRecording}
          onTouchEnd={cancelRecording}
          transition="all 0.2s"
          zIndex={3}
        >
          <FiMic size={18} />
        </Circle>
      </Box>
      
      {/* Voice Recording Component - Hidden but functional */}
      <Box display="none">
        <VoiceRecorder 
          onVoiceRecorded={handleVoiceRecorded}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
        />
      </Box>
    </Box>
  );
};

export default ChatInput;