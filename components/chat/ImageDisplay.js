// components/chat/ImageDisplay.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Image, 
  Spinner, 
  IconButton, 
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalCloseButton, 
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
  Fade,
  Progress,
  Collapse
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiZoomIn,
  FiRefreshCw,
  FiCopy,
  FiMaximize,
  FiImage,
  FiLink,
  FiShare2
} from 'react-icons/fi';
import imageService from '@/lib/imageGenerationService';

const ImageDisplay = ({ prompt, messageId = null, onImageGenerated = null }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasTriedGeneration, setHasTriedGeneration] = useState(false);
  const [hasTriedDbUpdate, setHasTriedDbUpdate] = useState(false);
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colors
  const modalBg = useColorModeValue('white', 'gray.800');
  const promptBg = useColorModeValue('gray.100', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
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
  }, [prompt, hasTriedGeneration, onImageGenerated]);
  
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
  const handleDownload = () => {
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
  const handleRetry = async () => {
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
  const handleShare = () => {
    if (navigator.clipboard && imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      // Add toast notification here if you have toast system
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        flexDirection="column"
        gap={2}
        my={4}
        p={4}
        borderRadius="md"
        bg={useColorModeValue('gray.50', 'gray.700')}
        border="1px dashed"
        borderColor={borderColor}
      >
        <HStack width="full" justify="space-between" mb={1}>
          <Badge colorScheme="blue" variant="subtle">
            <HStack spacing={1}>
              <FiImage size={12} />
              <Text fontSize="xs">AI Image</Text>
            </HStack>
          </Badge>
          <Text fontSize="xs" color="gray.500">{Math.round(progress)}%</Text>
        </HStack>
        
        <Progress 
          value={progress} 
          size="xs" 
          width="full" 
          colorScheme="blue" 
          borderRadius="full"
          hasStripe
          isAnimated
          mb={2}
        />
        
        <Skeleton 
          height="300px" 
          width="full" 
          startColor={useColorModeValue('gray.100', 'gray.600')} 
          endColor={useColorModeValue('gray.300', 'gray.800')} 
          speed={0.8}
          borderRadius="md"
        />
        
        <HStack width="full" justify="space-between" fontSize="sm" color="gray.500">
          <HStack>
            <Spinner size="sm" />
            <Text>Generating image...</Text>
          </HStack>
          <Text fontSize="xs" fontStyle="italic" maxW="70%" noOfLines={1} textAlign="right">
            {prompt}
          </Text>
        </HStack>
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box 
        p={4}
        my={4}
        color="red.500"
        bg={useColorModeValue('red.50', 'red.900')}
        borderRadius="md"
        border="1px solid"
        borderColor={useColorModeValue('red.100', 'red.700')}
      >
        <VStack align="stretch" spacing={3}>
          <Text fontSize="sm" fontWeight="medium">Error generating image</Text>
          <Text fontSize="sm">{error}</Text>
          <HStack>
            <Button 
              leftIcon={<FiRefreshCw />} 
              size="sm" 
              colorScheme="red" 
              variant="outline"
              onClick={handleRetry}
            >
              Try Again
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }
  
  // No image
  if (!imageUrl) return null;
  
  return (
    <Box my={4}>
      <Box 
        position="relative" 
        borderRadius="md"
        overflow="hidden"
        boxShadow="md"
        transition="all 0.2s"
        _hover={{ transform: 'scale(1.01)', boxShadow: 'lg' }}
      >
        <Image
          src={imageUrl}
          alt={prompt}
          borderRadius="md"
          width="full"
          objectFit="cover"
          cursor="pointer"
          onClick={onOpen}
          fallback={<Skeleton height="300px" width="full" />}
        />
        
        <Fade in={true}>
          <Box 
            position="absolute" 
            top={2} 
            left={2}
            bg="blackAlpha.500"
            color="white"
            px={2}
            py={1}
            borderRadius="md"
            fontSize="xs"
            backdropFilter="blur(4px)"
          >
            <HStack spacing={1}>
              <FiImage size={12} />
              <Text>AI Generated</Text>
            </HStack>
          </Box>
        </Fade>
      </Box>
      
      <HStack justify="space-between" mt={2}>
        <Text fontSize="xs" color="gray.500" noOfLines={1} maxW="80%">
          {prompt.substring(0, 60)}{prompt.length > 60 ? '...' : ''}
        </Text>
        
        <HStack spacing={1}>
          <Tooltip label="View Fullsize">
            <IconButton
              icon={<FiZoomIn size={16} />}
              size="sm"
              variant="ghost"
              onClick={onOpen}
              aria-label="View Fullsize"
            />
          </Tooltip>
          
          <Tooltip label="Download">
            <IconButton
              icon={<FiDownload size={16} />}
              size="sm"
              variant="ghost"
              onClick={handleDownload}
              aria-label="Download Image"
            />
          </Tooltip>
        </HStack>
      </HStack>
      
      {/* Fullscreen Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay backdropFilter="blur(8px)" />
        <ModalContent bg={modalBg} maxW="90vw" maxH="90vh" overflow="hidden">
          <ModalCloseButton zIndex={2} />
          
          <Box position="relative" overflow="hidden">
            <Image 
              src={imageUrl} 
              alt={prompt}
              objectFit="contain"
              maxH="80vh"
              w="full"
            />
            
            {/* Bottom prompt overlay */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="blackAlpha.700"
              p={4}
              backdropFilter="blur(10px)"
            >
              <VStack align="stretch" spacing={2}>
                <Box>
                  <Text color="white" fontWeight="bold" mb={1}>Prompt:</Text>
                  <Text color="whiteAlpha.900">{prompt}</Text>
                </Box>
                
                <HStack justify="flex-end" spacing={2}>
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
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageDisplay;