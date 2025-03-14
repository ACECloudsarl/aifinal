// components/chat/ImageDisplay.js - Enhanced with modern design
import React, { useState, useEffect, useRef } from 'react';
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
  useToast,
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
  FiCopy,
} from 'react-icons/fi';

// Simple mock image service (replace with your actual service)
const imageService = {
  // Cache for generated images
  imageCache: new Map(),
  
  // Subscribers for image updates
  subscribers: [],
  
  // Get image from cache
  getCachedImage(prompt) {
    return this.imageCache.get(prompt);
  },
  
  // Subscribe to image updates
  subscribe(callback) {
    const id = Date.now();
    this.subscribers.push({ id, callback });
    return id;
  },
  
  // Unsubscribe from updates
  unsubscribe(id) {
    this.subscribers = this.subscribers.filter(sub => sub.id !== id);
  },
  
  // Notify subscribers of image generation
  notifySubscribers(prompt, imageUrl) {
    this.subscribers.forEach(sub => {
      try {
        sub.callback(prompt, imageUrl);
      } catch (e) {
        console.error('Error in subscriber callback:', e);
      }
    });
  },
  
  // Generate an image (simplified mock)
  async generateImage(prompt, forceRegenerate = false) {
    if (!forceRegenerate && this.imageCache.has(prompt)) {
      return this.imageCache.get(prompt);
    }
    
    try {
      // Simulate API call to generate image
      console.log(`Generating image for prompt: ${prompt}`);
      
      // API call to generate image
      const response = await fetch('/api/images/generate-and-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      
      if (!data.success || !data.url) {
        throw new Error('Failed to get image URL');
      }
      
      // Store in cache and notify subscribers
      this.imageCache.set(prompt, data.url);
      this.notifySubscribers(prompt, data.url);
      
      return data.url;
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  },
  
  // Save image to database
  async saveToDatabase(messageId, prompt, imageUrl) {
    if (!messageId || messageId.startsWith('streaming-') || messageId.startsWith('temp-')) {
      return false;
    }
    
    try {
      const response = await fetch(`/api/messages/${messageId}/storeImage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageUrl,
          index: 0
        }),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error saving image to database:', error);
      return false;
    }
  }
};

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
  
  // Toast notifications
  const toast = useToast();
  
  // Modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Colors for modern dark mode
  const modalBg = useColorModeValue('rgba(0,0,0,0.9)', 'rgba(0,0,0,0.95)');
  const promptBg = useColorModeValue('gray.50', 'rgba(45, 55, 72, 0.3)');
  const borderColor = useColorModeValue('gray.200', 'hsla(0, 0%, 100%, .1)');
  const skeletonStartColor = useColorModeValue('gray.100', 'gray.700');
  const skeletonEndColor = useColorModeValue('gray.300', 'gray.600');
  const textColor = useColorModeValue('gray.800', '#f2f6fa');
  const errorBg = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.12)');
  
  // Subscription tracking
  const subscriptionIdRef = useRef(null);
  
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
          
          toast({
            title: "Image Generation Failed",
            description: err.message || "Failed to generate image",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
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
    
    toast({
      title: "Download Started",
      description: "Your image is being downloaded",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };
  
  // Retry generation
  const handleRetry = async (e) => {
    if (e) e.stopPropagation();
    setIsLoading(true);
    setError(null);
    setProgress(0);
    setRetryCount(prev => prev + 1);
    setHasTriedGeneration(false);
    
    toast({
      title: "Regenerating Image",
      description: "Please wait while we create a new image",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    
    try {
      await imageService.generateImage(prompt, true); // Force regeneration
    } catch (err) {
      setError(err.message || 'Failed to regenerate image');
      setIsLoading(false);
      
      toast({
        title: "Regeneration Failed",
        description: err.message || "Failed to regenerate image",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Share image (copy URL)
  const handleShare = (e) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard && imageUrl) {
      navigator.clipboard.writeText(imageUrl);
      
      toast({
        title: "URL Copied",
        description: "Image URL copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
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
        bg={useColorModeValue("gray.50", "gray.800")}
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
              color="blue.400"
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
        bg={errorBg}
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
        bg={useColorModeValue("white", "gray.800")}
        border="1px solid"
        borderColor={borderColor}
        transition="all 0.2s"
        _hover={{ boxShadow: "md", transform: "scale(1.02)" }}
        width={compact ? "100px" : "120px"}
        height={compact ? "100px" : "120px"}
        cursor="pointer"
        onClick={onOpen}
        role="group"
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
                <Text color="whiteAlpha.900" fontSize="sm" dir="auto">{prompt}</Text> {/* Auto RTL */}
                
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
                  
                  {!compact && (
                    <Button
                      leftIcon={<FiRefreshCw />}
                      onClick={handleRetry}
                      size="sm"
                      variant="outline"
                      colorScheme="whiteAlpha"
                    >
                      Regenerate
                    </Button>
                  )}
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