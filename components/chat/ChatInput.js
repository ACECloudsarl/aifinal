import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Textarea, 
  IconButton, 
  Button, 
  Tooltip, 
  Progress, 
  useToast,
  VStack,
  HStack,
  useColorModeValue,
  Flex,
  Text,
  Tag,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerContent,
  DrawerCloseButton,
  DrawerOverlay,
} from '@chakra-ui/react';
import { 
  LuSend, 
  LuPaperclip, 
  LuCircleStop, 
  LuVolume2, 
  LuVolumeX,
  LuImagePlus,
  LuWorkflow,
  LuMic,
  LuInfo,
  LuPlus,
  LuSettings2,
} from 'react-icons/lu';
import VoiceRecorder from './VoiceRecorder';

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
  const [isOptionsDrawerOpen, setIsOptionsDrawerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const textareaRef = useRef(null);
  const toast = useToast();
  
  // Color Palette
  const accentColor = useColorModeValue('purple.600', 'purple.300');
  const bgColor = useColorModeValue('white', 'gray.800');
  const inputBgColor = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const subtextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Suggestions for the user
  const suggestions = [
    "Create a vibrant digital artwork",
    "Explain a complex scientific concept",
    "Draft a creative short story",
    "Help me solve a challenging problem"
  ];
  
  // Available options/commands
  const options = [
    { 
      icon: LuImagePlus, 
      label: "Image Generation", 
      command: "/image",
      description: "Create AI-powered images" 
    },
    { 
      icon: LuWorkflow, 
      label: "AI Assistant", 
      command: "/assist",
      description: "Activate advanced AI mode" 
    },
    { 
      icon: LuInfo, 
      label: "Explain", 
      command: "/explain",
      description: "Get detailed explanations" 
    }
  ];
  
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
      setMessage(current => current + (current ? ' ' : '') + transcription);
      
      toast({
        title: "Voice Transcribed",
        description: transcription.length > 30 
          ? transcription.substring(0, 30) + "..." 
          : transcription,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Toggle auto TTS setting
  const toggleAutoTTS = () => {
    const newTTSState = !autoTTS;
    setAutoTTS(newTTSState);
    
    // Save to localStorage for persistence
    localStorage.setItem('autoTTS', newTTSState.toString());
    
    toast({
      title: newTTSState ? 'Auto TTS Enabled' : 'Auto TTS Disabled',
      description: newTTSState 
        ? 'Responses will be read aloud.' 
        : 'Responses will not be read aloud.',
      status: newTTSState ? 'success' : 'info',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    setShowSuggestions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  // Handle option/command click
  const handleOptionClick = (command) => {
    setMessage(prev => prev + command + ' ');
    setIsOptionsDrawerOpen(false);
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
      position="relative"
      bg={bgColor}
      borderRadius="2xl"
      boxShadow="lg"
      p={3}
    >
  
      
    
      
      {/* Input Container */}
      <Flex 
        direction="column" 
        position="relative"
      >
        {/* Top Row: Action Icons */}
        <HStack 
          spacing={2} 
          mb={2} 
          justify="space-between" 
          w="full"
        >
          {/* Options Drawer Trigger */}
          <Tooltip label="More Options">
            <IconButton 
              icon={<LuSettings2 />}
              variant="ghost"
              color={subtextColor}
              onClick={() => setIsOptionsDrawerOpen(true)}
              aria-label="Open Options"
            />
          </Tooltip>
          
          {/* Voice Recording Toggle */}
          <Tooltip label={isRecording ? "Stop Recording" : "Start Voice Input"}>
            <IconButton 
              icon={<LuMic />}
              variant={isRecording ? "solid" : "outline"} 
              colorScheme={isRecording ? "red" : "purple"}
              onClick={() => {
                setIsRecording(!isRecording);
           
              }}
              aria-label="Voice Recording"
            />
          </Tooltip>
        </HStack>
        
        {/* Textarea with Attachment */}
        <Flex 
          align="center" 
          bg={inputBgColor}
          borderRadius="xl"
          p={1}
          mb={2}
        >
          {/* Attachment Button */}
          <Tooltip label="Attach File">
            <IconButton 
              icon={<LuPaperclip />}
              variant="ghost"
              color={subtextColor}
              as="label"
              m={1}
              aria-label="Attach File"
            >
              <input type="file" hidden />
            </IconButton>
          </Tooltip>
          
          {/* Main Textarea */}
          <Textarea 
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            variant="unstyled"
            p={2}
            minHeight="60px"
            maxHeight="150px"
            resize="none"
            color={textColor}
            _placeholder={{ color: subtextColor }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
              // Open options on slash
              if (e.key === '/' && message === '') {
                setIsOptionsDrawerOpen(true);
              }
            }}
          />
        </Flex>
        
        {/* Send/Stop Button */}
        <Flex justify="flex-end">
          {!isStreaming ? (
            <Button
              leftIcon={<LuSend />}
              colorScheme="purple"
              variant="solid"
              isLoading={isLoading}
              onClick={handleSubmit}
              isDisabled={!message.trim()}
            >
              Send
            </Button>
          ) : (
            <Button
              leftIcon={<LuCircleStop />}
              colorScheme="red"
              variant="solid"
              onClick={onCancelStreaming}
            >
              Stop
            </Button>
          )}
        </Flex>
      </Flex>
      
      {/* Voice Recorder */}
      <VoiceRecorder 
        onVoiceRecorded={handleVoiceRecorded}
        isRecording={isRecording}
        setIsRecording={setIsRecording}
      />
      
      {/* Options Drawer */}
      <Drawer 
        isOpen={isOptionsDrawerOpen} 
        placement="bottom"
        onClose={() => setIsOptionsDrawerOpen(false)}
      >
        <DrawerOverlay />
        <DrawerContent borderTopRadius="xl">
          <DrawerCloseButton />
          <DrawerHeader>
            <Flex align="center" gap={2} color={accentColor}>
              <LuWorkflow />
              <Text>AI Options</Text>
            </Flex>
          </DrawerHeader>
          
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {options.map((option, index) => (
                <Button
                  key={index}
                  leftIcon={<option.icon />}
                  justifyContent="flex-start"
                  variant="ghost"
                  onClick={() => handleOptionClick(option.command)}
                  colorScheme="purple"
                >
                  <VStack align="start" spacing={0} ml={2}>
                    <Text fontWeight="bold">{option.label}</Text>
                    <Text fontSize="xs" color={subtextColor}>
                      {option.description}
                    </Text>
                  </VStack>
                </Button>
              ))}
            </VStack>
            
            {/* TTS Toggle */}
            <Button
              mt={4}
              w="full"
              leftIcon={autoTTS ? <LuVolume2 /> : <LuVolumeX />}
              onClick={toggleAutoTTS}
              variant="outline"
              colorScheme="purple"
            >
              {autoTTS ? 'Disable' : 'Enable'} Auto Text-to-Speech
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default ChatInput;