// components/chat/ImageGenerator.js - NO TEMPORARY IDS
import React, { useState, useEffect, useRef } from 'react';
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

// Global cache of generated images by prompt
const imageCache = new Map();

const ImageGenerator = ({ 
  prompt, 
  messageId = null, 
  storedImageUrl = null,
  index = 0,
  chatId = null,
  onImageGenerated = null
}) => {
  const [imageUrl, setImageUrl] = useState(storedImageUrl);
  const [isLoading, setIsLoading] = useState(!storedImageUrl);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  
  // Track if component is mounted
  const isMounted = useRef(true);
  
  // Keep track of whether we've attempted to update the database
  const hasAttemptedDbUpdate = useRef(false);
  
  // Store the generated URL for later database update
  const generatedUrlRef = useRef(null);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Generate the image once on mount
  useEffect(() => {
    const generateImage = async () => {
      // Skip if we already have an image
      if (storedImageUrl || imageUrl) {
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Check cache first
        if (imageCache.has(prompt)) {
          console.log(`Using cached image for prompt: ${prompt.substring(0, 30)}...`);
          const cachedUrl = imageCache.get(prompt);
          setImageUrl(cachedUrl);
          generatedUrlRef.current = cachedUrl;
          setIsLoading(false);
          
          // Update UI immediately via callback
          if (onImageGenerated) {
            onImageGenerated(prompt, cachedUrl, index);
          }
          return;
        }
        
        console.log(`Generating image for prompt: ${prompt.substring(0, 30)}...`);
        
        // Generate and upload the image
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
        
        console.log(`Image generated successfully: ${data.url}`);
        
        // Add to cache
        imageCache.set(prompt, data.url);
        
        // Update state if still mounted
        if (isMounted.current) {
          setImageUrl(data.url);
          generatedUrlRef.current = data.url;
          setIsLoading(false);
          
          // Update UI immediately via callback
          if (onImageGenerated) {
            onImageGenerated(prompt, data.url, index);
          }
        }
      } catch (error) {
        console.error('Error generating image:', error);
        if (isMounted.current) {
          setError(error.message || 'Failed to generate image');
          setIsLoading(false);
        }
      }
    };
    
    generateImage();
  }, [prompt, storedImageUrl, index, onImageGenerated]);
  
  // Attempt to update the database when messageId becomes available
  useEffect(() => {
    const updateDatabase = async () => {
      // Only proceed if:
      // 1. We have a valid messageId (not a streaming ID)
      // 2. We have a generated image URL
      // 3. We haven't attempted to update the database yet
      if (
        messageId && 
        !messageId.startsWith('streaming-') && 
        !messageId.startsWith('temp-') &&
        generatedUrlRef.current && 
        !hasAttemptedDbUpdate.current
      ) {
        console.log(`Updating database with generated image for message: ${messageId}`);
        hasAttemptedDbUpdate.current = true;
        
        try {
          // Call API to update the message metadata
          const response = await fetch(`/api/messages/${messageId}/storeImage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt,
              imageUrl: generatedUrlRef.current,
              index
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to store image in database');
          }
          
          console.log(`Successfully updated database for message: ${messageId}`);
        } catch (error) {
          console.error('Error updating database:', error);
          // We don't set an error state here as the image is still displayed correctly
        }
      }
    };
    
    updateDatabase();
  }, [messageId, prompt, index]);
  
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

export default ImageGenerator;