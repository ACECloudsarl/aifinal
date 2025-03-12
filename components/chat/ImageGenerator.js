// components/chat/ImageGenerator.js
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

const ImageGenerator = ({ 
  prompt, 
  messageId, 
  storedImage = false, 
  imageData: initialImageData = null,
  index = 0,
  onImageGenerated = null
}) => {
  const [imageData, setImageData] = useState(initialImageData);
  const [isLoading, setIsLoading] = useState(!storedImage && !initialImageData);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const generateImage = async () => {
      // Only generate if this is a new image (not stored) and we don't have imageData yet
      if (storedImage || imageData) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/images/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt, messageId, index }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to generate image');
        }
        
        setImageData(data.imageData);
        
        // Save the generated image to the message in the database
        if (messageId && onImageGenerated) {
          onImageGenerated(messageId, prompt, data.imageData, index);
        }
      } catch (error) {
        console.error('Error generating image:', error);
        setError(error.message || 'Failed to generate image');
      } finally {
        setIsLoading(false);
      }
    };
    
    generateImage();
  }, [prompt, messageId, storedImage, imageData, index, onImageGenerated]);
  
  const handleDownload = () => {
    if (!imageData) return;
    
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `generated-image-${Date.now()}.png`;
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
  
  if (!imageData) return null;
  
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
        }}
        onClick={() => setOpen(true)}
      >
        <img
          src={`data:image/png;base64,${imageData}`}
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
              src={`data:image/png;base64,${imageData}`}
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