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
  HStack
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiZoomIn 
} from 'react-icons/fi';
import imageService from '@/lib/imageGenerationService';

const ImageDisplay = ({ prompt, messageId = null }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasTriedGeneration, setHasTriedGeneration] = useState(false);
  const [hasTriedDbUpdate, setHasTriedDbUpdate] = useState(false);
  
  // Subscription tracking
  const subscriptionIdRef = React.useRef(null);
  
  // Initial check for cached image and start generation
  useEffect(() => {
    const init = async () => {
      // Check cached image
      const cachedUrl = imageService.getCachedImage(prompt);
      if (cachedUrl) {
        setImageUrl(cachedUrl);
        setIsLoading(false);
        return;
      }
      
      // Subscribe to image updates
      subscriptionIdRef.current = imageService.subscribe((updatedPrompt, updatedUrl) => {
        if (updatedPrompt === prompt) {
          setImageUrl(updatedUrl);
          setIsLoading(false);
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
  }, [prompt, hasTriedGeneration]);
  
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
  
  // Loading state
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        flexDirection="column"
        gap={2}
        my={2}
        p={3}
        borderRadius="md"
        bg="gray.50"
      >
        <Spinner size="md" />
        <Text fontSize="sm">Generating image...</Text>
      </Box>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Box 
        p={2} 
        my={2}
        color="red.500"
        bg="red.50"
        borderRadius="md"
      >
        <Text fontSize="sm">Error generating image: {error}</Text>
      </Box>
    );
  }
  
  // No image
  if (!imageUrl) return null;
  
  return (
    <Box my={2}>
      <Image
        src={imageUrl}
        alt={prompt}
        borderRadius="md"
        maxWidth="400px"
        cursor="pointer"
        transition="transform 0.2s"
        _hover={{ transform: 'scale(1.01)' }}
        onClick={() => setIsModalOpen(true)}
      />
      
      <HStack justify="flex-end" mt={1} spacing={1}>
        <IconButton
          icon={<FiZoomIn />}
          size="sm"
          variant="ghost"
          onClick={() => setIsModalOpen(true)}
        />
        
        <IconButton
          icon={<FiDownload />}
          size="sm"
          variant="ghost"
          onClick={handleDownload}
        />
      </HStack>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <VStack p={4} spacing={4}>
            <Image 
              src={imageUrl} 
              alt={prompt}
              maxHeight="80vh"
              objectFit="contain"
            />
            <Box 
              bg="gray.100" 
              p={3} 
              borderRadius="md" 
              width="full"
            >
              <Text fontWeight="bold">Prompt:</Text>
              <Text>{prompt}</Text>
            </Box>
            <HStack width="full" justify="flex-end" spacing={2}>
              <IconButton
                icon={<FiDownload />}
                onClick={handleDownload}
                variant="solid"
                colorScheme="blue"
              >
                Download
              </IconButton>
            </HStack>
          </VStack>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageDisplay;