// components/chat/ChatMessage.js - Redesigned with thumbnail images
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Text, 
  Avatar, 
  IconButton, 
  Tooltip, 
  VStack, 
  HStack, 
  Flex,
  Image,
  useColorModeValue,
  Skeleton,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Fade,
  Badge,
  Collapse,
  Divider,
  Wrap,
  WrapItem,
  Modal,
  ModalOverlay,
  ModalContent,
  Center,
  Circle,
} from '@chakra-ui/react';
import { 
  FiCopy, 
  FiRefreshCw, 
  FiVolume2, 
  FiVolumeX,
  FiMoreVertical,
  FiThumbsUp,
  FiThumbsDown,
  FiCheck,
  FiDownload,
  FiZoomIn,
  FiX,
  FiImage,
} from 'react-icons/fi';
import ImageDisplay from './ImageDisplay';
import voiceService from '@/lib/VoiceService';

const ChatMessage = ({ 
  message, 
  onCopy, 
  onRegenerate, 
  onSpeak, 
  bot, 
  localImages = {},
  isStreaming = false,
  onImageGenerated
}) => {
  const [isRTL, setIsRTL] = useState(false);
  const [isMessageSpeaking, setIsMessageSpeaking] = useState(false);
  const [autoTTSEnabled, setAutoTTSEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  
  // Modal for full image view
  const { isOpen, onOpen, onClose } = useDisclosure();
  
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
  
  // Determine number of images to adjust layout grid
  const storedImageCount = (message.metadata?.imageUrls?.length || 0) + (message.metadata?.imageData?.length || 0);
  const generatedImageCount = imageTags.length;
  const imageCount = storedImageCount + generatedImageCount;
  
  // Colors and Styles
  const userBubbleBg = useColorModeValue("blue.50", "blue.800");
  const botBubbleBg = useColorModeValue("gray.50", "gray.700");
  const userTextColor = useColorModeValue("gray.800", "white");
  const botTextColor = useColorModeValue("gray.800", "white");
  const lightBorderColor = useColorModeValue("gray.200", "gray.600");
  const controlsBg = useColorModeValue("white", "gray.800");
  const modalBg = useColorModeValue('rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)');
  
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
  
  // Handle copy with animation
  const handleCopy = () => {
    onCopy(hasStoredImages ? message.content : textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Show image in fullscreen
  const showFullImage = (url, imgPrompt) => {
    setSelectedImage(url);
    setSelectedPrompt(imgPrompt || "AI generated image");
    onOpen();
  };
  
  // Download selected image
  const handleDownloadSelected = () => {
    if (!selectedImage) return;
    
    const link = document.createElement('a');
    link.href = selectedImage;
    link.download = `ai-image-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Content rendering helper
  const renderContent = () => {
    if (isStreaming && !isUser) {
      return (
        <Box pos="relative">
          <Text whiteSpace="pre-wrap">{textContent || " "}</Text>
          {textContent === "" && <Skeleton height="20px" width="60%" mt={2} />}
          <Box 
            pos="absolute" 
            bottom={0} 
            right={-4} 
            h="16px" 
            w="16px" 
            borderRadius="full"
          >
            <Box
              pos="absolute"
              h="16px"
              w="16px"
              borderRadius="full"
              bg={useColorModeValue("blue.400", "blue.500")}
              opacity={0.5}
              animation="pulse 1.5s infinite"
            />
          </Box>
        </Box>
      );
    }
    
    // Regular content
    return (
      <Text whiteSpace="pre-wrap">
        {hasStoredImages ? message.content : textContent}
      </Text>
    );
  };

  return (
    <Box
      data-testid={`message-${isUser ? 'user' : 'bot'}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      position="relative"
      mb={4}
    >
      <HStack 
        align="flex-start" 
        spacing={3}
        justify={isUser ? "flex-end" : "flex-start"}
      >
        {/* Avatar - only show on left for bot */}
        {!isUser && (
          <Avatar
            src={bot?.avatar}
            name={bot?.name}
            size="sm"
            mt={1}
          />
        )}
        
        <VStack 
          align={isUser ? "flex-end" : "flex-start"} 
          spacing={1}
          maxW={{ base: "85%", md: "75%" }}
        >
          {/* Author name - small, subtle text above message */}
          <Text
            fontSize="xs"
            color="gray.500"
            fontWeight="medium"
            ml={isUser ? 0 : 2}
            mr={isUser ? 2 : 0}
          >
            {isUser ? "You" : bot?.name}
          </Text>
          
          {/* Message content */}
          <Box
            bg={isUser ? userBubbleBg : botBubbleBg}
            color={isUser ? userTextColor : botTextColor}
            px={4}
            py={3}
            borderRadius="lg"
            borderTopRightRadius={isUser ? "sm" : "lg"}
            borderTopLeftRadius={isUser ? "lg" : "sm"}
            width="full"
            boxShadow="sm"
          >
            {/* Text content */}
            {renderContent()}
            
            {/* Thumbnail image grid - showing all images as small thumbnails */}
            {(hasStoredImages || imageTags.length > 0) && (
              <Wrap spacing={2} mt={3}>
                {/* Stored Image URLs */}
                {message.metadata?.imageUrls?.map((url, index) => (
                  <WrapItem key={`stored-${message.id}-${index}`}>
                    <Box
                      position="relative"
                      overflow="hidden"
                      borderRadius="md"
                      boxShadow="sm"
                      bg={useColorModeValue("gray.100", "gray.700")}
                      border="1px solid"
                      borderColor={lightBorderColor}
                      transition="all 0.2s"
                      _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
                      width="100px"
                      height="100px"
                      cursor="pointer"
                      onClick={() => showFullImage(
                        url, 
                        message.metadata.imagePrompts?.[index] || "AI generated image"
                      )}
                    >
                      <Image
                        src={url}
                        alt={message.metadata.imagePrompts?.[index] || "AI generated image"}
                        objectFit="cover"
                        width="full"
                        height="full"
                        fallback={<Skeleton height="100%" width="100%" />}
                      />
                      
                      {/* Small Badge */}
                      <Badge
                        position="absolute"
                        top={1}
                        left={1}
                        colorScheme="blue"
                        bg="blackAlpha.700"
                        color="white"
                        fontSize="2xs"
                        px={1}
                        py={0.5}
                        borderRadius="sm"
                      >
                        <HStack spacing={0.5} alignItems="center">
                          <FiImage size={8} />
                          <Text fontSize="2xs">AI</Text>
                        </HStack>
                      </Badge>
                    </Box>
                  </WrapItem>
                ))}
                
                {/* Legacy Base64 Images */}
                {message.metadata?.imageData?.map((base64Data, index) => (
                  <WrapItem key={`legacy-${message.id}-${index}`}>
                    <Box
                      position="relative"
                      overflow="hidden"
                      borderRadius="md"
                      boxShadow="sm"
                      bg={useColorModeValue("gray.100", "gray.700")}
                      border="1px solid"
                      borderColor={lightBorderColor}
                      transition="all 0.2s"
                      _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
                      width="100px"
                      height="100px"
                      cursor="pointer"
                      onClick={() => showFullImage(
                        `data:image/png;base64,${base64Data}`, 
                        message.metadata.imagePrompts?.[index] || "AI generated image"
                      )}
                    >
                      <Image
                        src={`data:image/png;base64,${base64Data}`}
                        alt={message.metadata.imagePrompts?.[index] || "AI generated image"}
                        objectFit="cover"
                        width="full"
                        height="full"
                        fallback={<Skeleton height="100%" width="100%" />}
                      />
                      
                      {/* Small Badge */}
                      <Badge
                        position="absolute"
                        top={1}
                        left={1}
                        colorScheme="blue"
                        bg="blackAlpha.700"
                        color="white"
                        fontSize="2xs"
                        px={1}
                        py={0.5}
                        borderRadius="sm"
                      >
                        <HStack spacing={0.5} alignItems="center">
                          <FiImage size={8} />
                          <Text fontSize="2xs">AI</Text>
                        </HStack>
                      </Badge>
                    </Box>
                  </WrapItem>
                ))}
                
                {/* New Images via ImageDisplay - thumbnails now */}
                {!hasStoredImages && imageTags.map((prompt, index) => (
                  <WrapItem key={`display-${prompt.substring(0, 20)}`}>
                    <ImageDisplay
                      prompt={prompt}
                      messageId={message.id}
                      onImageGenerated={onImageGenerated}
                      localImageUrl={localImages[prompt]}
                      compact={true} // always compact to make thumbnails
                    />
                  </WrapItem>
                ))}
              </Wrap>
            )}
          </Box>
          
          {/* Message controls - conditionally shown */}
          <Fade in={showControls && !isUser && !isStreaming}>
            <HStack spacing={1} py={1} px={2} borderRadius="md">
              <Tooltip label={copied ? "Copied!" : "Copy"}>
                <IconButton
                  icon={copied ? <FiCheck /> : <FiCopy />}
                  size="xs"
                  variant="ghost"
                  colorScheme={copied ? "green" : "gray"}
                  onClick={handleCopy}
                  aria-label="Copy message"
                />
              </Tooltip>
              
              <Tooltip label="Regenerate">
                <IconButton
                  icon={<FiRefreshCw size={14} />}
                  size="xs"
                  variant="ghost"
                  onClick={() => onRegenerate(message.id)}
                  aria-label="Regenerate message"
                />
              </Tooltip>
              
              <Tooltip label={isMessageSpeaking ? "Stop Speaking" : "Speak"}>
                <IconButton
                  icon={isMessageSpeaking ? <FiVolumeX /> : <FiVolume2 />}
                  size="xs"
                  variant="ghost"
                  colorScheme={isMessageSpeaking ? "red" : "gray"}
                  onClick={handleSpeak}
                  aria-label={isMessageSpeaking ? "Stop speaking" : "Speak message"}
                />
              </Tooltip>
              
              <Menu placement="bottom-end">
                <MenuButton
                  as={IconButton}
                  icon={<FiMoreVertical />}
                  size="xs"
                  variant="ghost"
                  aria-label="More options"
                />
                <MenuList fontSize="sm" minW="150px">
                  <MenuItem icon={<FiThumbsUp size={14} />}>
                    Helpful
                  </MenuItem>
                  <MenuItem icon={<FiThumbsDown size={14} />}>
                    Not helpful
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          </Fade>
        </VStack>
        
        {/* Avatar - only show on right for user */}
        {isUser && (
          <Avatar
            src="/images/user-avatar.png"
            name="User"
            size="sm"
            mt={1}
          />
        )}
      </HStack>
      
      {/* Fullscreen Modal for Image Viewing */}
      <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        size="full" 
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay bg={modalBg} backdropFilter="blur(8px)" />
        <ModalContent bg="transparent" boxShadow="none" maxW="100vw" maxH="100vh">
          <Box position="relative" height="100vh" width="100vw" onClick={onClose}>
            {/* Centered Image */}
            <Center height="100vh" width="100vw" p={4} position="relative">
              <Image 
                src={selectedImage} 
                alt={selectedPrompt}
                objectFit="contain"
                maxH="80vh"
                maxW="90vw"
                borderRadius="md"
                boxShadow="dark-lg"
              />
            </Center>
            
            {/* Bottom prompt area */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="blackAlpha.800"
              p={4}
              backdropFilter="blur(10px)"
            >
              <VStack align="stretch" spacing={2} maxW="800px" mx="auto">
                <Text color="white" fontWeight="bold" fontSize="sm">Prompt:</Text>
                <Text color="whiteAlpha.900" fontSize="sm">{selectedPrompt}</Text>
                
                <HStack justify="flex-end" spacing={3} mt={1}>
                  <IconButton 
                    icon={<FiDownload />} 
                    onClick={handleDownloadSelected}
                    colorScheme="blue"
                    aria-label="Download image"
                  />
                </HStack>
              </VStack>
            </Box>
            
            {/* Close Button - Bottom Right */}
            <Circle
              size="50px"
              bg="blackAlpha.800"
              color="white"
              position="absolute"
              right={6}
              bottom={20}
              cursor="pointer"
              _hover={{ bg: "blackAlpha.900", transform: "scale(1.05)" }}
              onClick={onClose}
              boxShadow="dark-lg"
              transition="all 0.2s"
            >
              <FiX size={24} />
            </Circle>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ChatMessage;