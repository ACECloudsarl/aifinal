// components/admin/SeedVoicesButton.js
import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Checkbox,
  FormControl,
  FormLabel,
  Alert,
  Stack,
  Box,
  CircularProgress,
  ModalOverflow,
} from '@mui/joy';
import { Download, CheckCircle } from 'lucide-react';

const SeedVoicesButton = ({ onSeedComplete }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [fetchFromElevenLabs, setFetchFromElevenLabs] = useState(true);
  
  const handleOpen = () => {
    setOpen(true);
    setSuccess(null);
    setError(null);
  };
  
  const handleClose = () => {
    if (!loading) {
      setOpen(false);
    }
  };
  
  const handleSeed = async () => {
    setLoading(true);
    setSuccess(null);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/voices/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fetchFromElevenLabs,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to seed voices');
      }
      
      const data = await response.json();
      setSuccess(data);
      
      // Notify parent component
      if (onSeedComplete) {
        onSeedComplete(data);
      }
    } catch (err) {
      console.error('Error seeding voices:', err);
      setError(err.message || 'Failed to seed voices');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Button
        variant="outlined"
        color="neutral"
        startDecorator={<Download size={18} />}
        onClick={handleOpen}
      >
        Seed Voices
      </Button>
      
      <Modal open={open} onClose={handleClose}>
        <ModalDialog variant="outlined">
          <ModalClose disabled={loading} />
          <Typography level="h4">Seed Voice Database</Typography>
          
          <Stack spacing={2} sx={{ my: 3 }}>
            <Typography>
              This will import predefined voices into your database. You can choose to fetch the latest voices from ElevenLabs API or use the default set.
            </Typography>
            
            <FormControl orientation="horizontal" sx={{ alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={fetchFromElevenLabs}
                onChange={(e) => setFetchFromElevenLabs(e.target.checked)}
                id="elevenlabs-checkbox"
              />
              <FormLabel htmlFor="elevenlabs-checkbox">
                Fetch from ElevenLabs API
              </FormLabel>
            </FormControl>
            
            {success && (
              <Alert
                color="success"
                startDecorator={<CheckCircle />}
                variant="soft"
              >
                <Typography fontWeight="bold">Success!</Typography>
                <Typography>{success.message}</Typography>
                <Typography level="body-sm">
                  Created: {success.results.created} | Updated: {success.results.updated} | Skipped: {success.results.skipped}
                </Typography>
              </Alert>
            )}
            
            {error && (
              <Alert color="danger" variant="soft">
                {error}
              </Alert>
            )}
          </Stack>
          
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="plain"
              color="neutral"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSeed}
              loading={loading}
              loadingPosition="start"
              startDecorator={!loading && <Download />}
            >
              {loading ? 'Importing...' : 'Import Voices'}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
};

export default SeedVoicesButton;