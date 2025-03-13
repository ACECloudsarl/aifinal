// components/chat/ImageDisplay.js - Redesigned with thumbnail approach
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Image, 
  Spinner, 
  IconButton, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  Text, 
  VStack,
  HStack,
  useColorModeValue,
  Skeleton,
  Badge,
  Button,
  Flex,
  useDisclosure,
  Tooltip,
  Progress,
  AspectRatio,
  Collapse,
  Circle,
  Center,
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiZoomIn,
  FiRefreshCw,
  FiX,
  FiMaximize,
  FiImage,
  FiInfo,
  FiShare2,
} from 'react-icons/fi';
import imageService from '@/lib/imageGenerationService';

const ImageDisplay = ({ 
  prompt, 
  messageId = null, 
  onImageGenerated = null,
  localImageUrl = null,
  compact = false
}) => {
  const [imageUrl, setImageUrl] = useState(localImageUrl);
  const [isLoading, setIsLoading] = useState(!localImageUrl);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [hasTriedGeneration, setHasTriedGeneration] = useState(false);
  const [hasTriedDbUpdate, setHasTriedDbUpdate] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colors
  const modalBg = useColorModeValue('rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)');
  const promptBg = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.600');
  const skeletonStartColor = useColorModeValue('gray.100', 'gray.700');
  const skeletonEndColor = useColorModeValue('gray.300', 'gray.600');
  
  // Subscription tracking
  const subscriptionIdRef = React.useRef(null);
  
  // Progress simulation 
  useEffect(() => {
    if (isLoading && !imageUrl) {
      const interval = setInterval(() => {
        setProgress(prev => {
          // Slow down as we reach higher percentages
          const increment = prev < 30 ? 8 : prev < 60 ? 4 : prev < 85 ? 2 : 0.5;
          const newValue = prev + increment;
          return newValue >= 100 ? 99 : newValue;
        });
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [isLoading, imageUrl]);
  
  // Initial check for cached image and start generation
  useEffect(() => {
    // If we already have a URL from props, use it
    if (localImageUrl) {
      setImageUrl(localImageUrl);
      setIsLoading(false);
      setProgress(100);
      return;
    }
    
    const init = async () => {
      // Check cached image
      const cachedUrl = imageService.getCachedImage(prompt);
      if (cachedUrl) {
        setImageUrl(cachedUrl);
        setIsLoading(false);
        setProgress(100);
        
        // Notify parent if callback provided
        if (onImageGenerated) {
          onImageGenerated(prompt, cachedUrl);
        }
        return;
      }
      
      // Subscribe to image updates
      subscriptionIdRef.current = imageService.subscribe((updatedPrompt, updatedUrl) => {
        if (updatedPrompt === prompt) {
          setImageUrl(updatedUrl);
          setIsLoading(false);
          setProgress(100);
          
          // Notify parent if callback provided
          if (onImageGenerated) {
            onImageGenerated(prompt, updatedUrl);
          }
        }
      });
      
      // Start generation if not tried
      if (!hasTriedGeneration) {
        setHasTriedGeneration(true);
        try {
          await imageService.generateImage(prompt);
        } catch (err) {
          setError(err.message || 'Failed to generate image');
          setIsLoading(false);
        }
      }
    };
    
    init();
    
    // Cleanup subscription
    return () => {
      if (subscriptionIdRef.current !== null) {
        imageService.unsubscribe(subscriptionIdRef.current);
      }
    };
  }, [prompt, hasTriedGeneration, onImageGenerated, localImageUrl]);
  
  // Save to database when message ID and image URL are available
  useEffect(() => {
    const saveToDb = async () => {
      if (
        messageId && 
        !messageId.startsWith('streaming-') && 
        !messageId.startsWith('temp-') && 
        imageUrl && 
        !hasTriedDbUpdate
      ) {
        setHasTriedDbUpdate(true);
        await imageService.saveToDatabase(messageId, prompt, imageUrl);
      }
    };
    
    saveToDb();
  }, [messageId, imageUrl, prompt, hasTriedDbUpdate]);
  
  // Download image
  const handleDownload = (e) => {
    if (e) e.stopPropagation();
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-image-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Retry generation
  const handleRetry = async (e) => {
    if (e) e.stopPropagation();
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setRetryCount(prev => prev + 1);
    setHasTriedGeneration(false);
    
    try {
      await imageService.generateImage(prompt, true); // Force regeneration
    } catch (err) {
      setError(err.message || 'Failed to regenerate image');
      setIsLoading(false);
    }
  };
  
  // Share image (copy URL)
  const handleShare = (e) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard && imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      // Add toast notification here if you have toast system
    }
  };
  
  // Loading state with elegant skeleton - smaller for thumbnail
  if (isLoading) {
    return (
      <Box 
        position="relative"
        overflow="hidden"
        borderRadius="md"
        boxShadow="sm"
        bg={useColorModeValue("gray.50", "gray.700")}
        border="1px solid"
        borderColor={borderColor}
        width={compact ? "100px" : "120px"}
        height={compact ? "100px" : "120px"}
      >
        <VStack spacing={0} width="full" height="full">
          {/* Progress bar */}
          <Progress 
            value={progress} 
            size="xs" 
            width="full" 
            colorScheme="blue" 
            hasStripe
            isAnimated
            borderRadius={0}
          />
          
          {/* Skeleton image container */}
          <Center flex="1" width="full" position="relative">
            <Skeleton 
              startColor={skeletonStartColor}
              endColor={skeletonEndColor}
              speed={0.8}
              width="90%"
              height="90%"
              borderRadius="md"
            />
            <Spinner 
              size="sm" 
              position="absolute" 
              top="50%" 
              left="50%" 
              transform="translate(-50%, -50%)"
            />
          </Center>
        </VStack>
      </Box>
    );
  }
  
  // Error state - smaller for thumbnail
  if (error) {
    return (
      <Box 
        p={2}
        color="red.500"
        bg={useColorModeValue('red.50', 'red.900')}
        borderRadius="md"
        border="1px solid"
        borderColor={useColorModeValue('red.100', 'red.700')}
        width={compact ? "100px" : "120px"}
      >
        <VStack align="stretch" spacing={1}>
          <Text fontSize="xs" fontWeight="medium">Error</Text>
          <IconButton 
            icon={<FiRefreshCw size={14} />} 
            size="xs" 
            colorScheme="red" 
            onClick={handleRetry}
            aria-label="Try again"
          />
        </VStack>
      </Box>
    );
  }
  
  // No image
  if (!imageUrl) return null;
  
  return (
    <>
      {/* Thumbnail Image */}
      <Box
        position="relative"
        overflow="hidden"
        borderRadius="md"
        boxShadow="sm"
        bg={useColorModeValue("white", "gray.700")}
        border="1px solid"
        borderColor={borderColor}
        transition="all 0.2s"
        _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
        width={compact ? "100px" : "120px"}
        height={compact ? "100px" : "120px"}
        cursor="pointer"
        onClick={onOpen}
      >
        <Image
          src={imageUrl}
          alt={prompt}
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
        
        {/* Zoom icon on hover */}
        <Circle
          size="24px"
          bg="blackAlpha.700"
          color="white"
          position="absolute"
          right={1}
          bottom={1}
          opacity={0}
          _groupHover={{ opacity: 1 }}
          transition="opacity 0.2s"
        >
          <FiZoomIn size={12} />
        </Circle>
      </Box>
      
      {/* Fullscreen Modal */}
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
                src={imageUrl} 
                alt={prompt}
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
                <Text color="whiteAlpha.900" fontSize="sm">{prompt}</Text>
                
                <HStack justify="flex-end" spacing={3} mt={1}>
                  <Button 
                    leftIcon={<FiDownload />} 
                    onClick={handleDownload}
                    size="sm"
                    colorScheme="blue"
                  >
                    Download
                  </Button>
                  
                  <Button
                    leftIcon={<FiShare2 />}
                    onClick={handleShare}
                    size="sm"
                    variant="outline"
                    colorScheme="whiteAlpha"
                  >
                    Share
                  </Button>
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
    </>
  );
};

export default ImageDisplay;