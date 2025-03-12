// components/chat/ImageDisplay.js
// A component to display images from the ImageGenerationService
import React, { useState, useEffect } from 'react';
import {
  Box,
  AspectRatio,
  CircularProgress,
  IconButton,
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
} from '@mui/joy';
import { Download, ZoomIn } from 'lucide-react';
import imageService from '../../lib/imageGenerationService';

const ImageDisplay = ({ prompt, messageId = null }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [hasTriedGeneration, setHasTriedGeneration] = useState(false);
  const [hasTriedDbUpdate, setHasTriedDbUpdate] = useState(false);
  
  // Use a ref to track subscription ID for cleanup
  const subscriptionIdRef = React.useRef(null);
  
  // Initial check for cached image and start generation if needed
  useEffect(() => {
    const init = async () => {
      // Check if the image is already cached
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
      
      // Start generation if we haven't tried yet
      if (!hasTriedGeneration) {
        setHasTriedGeneration(true);
        try {
          // This won't generate again if it's already in progress or cached
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
  
  // Save to database when we have a valid message ID and image URL
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
  
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 1,
        my: 2,
        p: 3,
        borderRadius: 'md',
        backgroundColor: 'background.level1',
      }}>
        <CircularProgress size="md" />
        <Typography level="body-sm">Generating image...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ 
        p: 2, 
        my: 2,
        color: 'danger.500',
        borderRadius: 'md',
        backgroundColor: 'danger.softBg',
      }}>
        <Typography level="body-sm">Error generating image: {error}</Typography>
      </Box>
    );
  }
  
  if (!imageUrl) return null;
  
  return (
    <Box sx={{ my: 2 }}>
      <AspectRatio 
        ratio="1/1" 
        objectFit="cover" 
        sx={{ 
          borderRadius: 'md',
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.01)',
          },
          maxWidth: 400,
        }}
        onClick={() => setOpen(true)}
      >
        <img
          src={imageUrl}
          alt={prompt}
          loading="lazy"
        />
      </AspectRatio>
      
      <Box sx={{ display: 'flex', gap: 1, mt: 1, justifyContent: 'flex-end' }}>
        <IconButton
          size="sm"
          variant="plain"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <ZoomIn size={16} />
        </IconButton>
        
        <IconButton
          size="sm"
          variant="plain"
          color="neutral"
          onClick={handleDownload}
        >
          <Download size={16} />
        </IconButton>
      </Box>
      
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalDialog
          sx={{
            maxWidth: 'min(90vw, 800px)',
            maxHeight: '90vh',
            p: 0,
            overflow: 'hidden',
          }}
        >
          <ModalClose />
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={imageUrl}
              alt={prompt}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(0,0,0,0.6)', 
              color: 'white',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backdropFilter: 'blur(10px)',
            }}>
              <Typography level="body-md" fontWeight="bold">Prompt:</Typography>
              <Typography level="body-sm">{prompt}</Typography>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default ImageDisplay;