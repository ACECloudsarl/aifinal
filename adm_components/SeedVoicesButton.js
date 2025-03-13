// components/admin/SeedVoicesButton.js
import React, { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
  Box,
  Spinner,
  Text,
  useDisclosure,
  VStack,
  HStack,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { DownloadCloud, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const SeedVoicesButton = ({ onSeedComplete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [fetchFromElevenLabs, setFetchFromElevenLabs] = useState(true);
  
  // Colors
  const alertSuccessBg = useColorModeValue('green.50', 'green.900');
  const alertErrorBg = useColorModeValue('red.50', 'red.900');
  
  const handleOpen = () => {
    onOpen();
    setSuccess(null);
    setError(null);
  };
  
  const handleClose = () => {
    if (!loading) {
      onClose();
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
        variant="outline"
        leftIcon={<DownloadCloud size={18} />}
        onClick={handleOpen}
        colorScheme="purple"
      >
        Seed Voices
      </Button>
      
      <Modal isOpen={isOpen} onClose={handleClose}>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent>
          <ModalHeader>Seed Voice Database</ModalHeader>
          <ModalCloseButton disabled={loading} />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                This will import predefined voices into your database. You can choose to fetch the latest voices from ElevenLabs API or use the default set.
              </Text>
              
              <FormControl display="flex" alignItems="center">
                <Checkbox
                  id="elevenlabs-checkbox"
                  isChecked={fetchFromElevenLabs}
                  onChange={(e) => setFetchFromElevenLabs(e.target.checked)}
                  colorScheme="purple"
                />
                <FormLabel htmlFor="elevenlabs-checkbox" mb="0" ml={2}>
                  Fetch from ElevenLabs API
                </FormLabel>
              </FormControl>
              
              <Divider />
              
              {loading && (
                <Box textAlign="center" py={4}>
                  <Spinner size="xl" color="purple.500" mb={4} />
                  <Text>Importing voices...</Text>
                </Box>
              )}
              
              {success && (
                <Alert 
                  status="success" 
                  variant="subtle" 
                  borderRadius="md"
                  bg={alertSuccessBg}
                >
                  <AlertIcon as={CheckCircle} />
                  <Box>
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                      {success.message}
                      <HStack mt={2} spacing={4} fontSize="sm">
                        <Box>
                          <Text fontWeight="bold">Created</Text>
                          <Text>{success.results.created}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Updated</Text>
                          <Text>{success.results.updated}</Text>
                        </Box>
                        <Box>
                          <Text fontWeight="bold">Skipped</Text>
                          <Text>{success.results.skipped}</Text>
                        </Box>
                      </HStack>
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              
              {error && (
                <Alert 
                  status="error" 
                  variant="subtle"
                  borderRadius="md"
                  bg={alertErrorBg}
                >
                  <AlertIcon as={AlertCircle} />
                  <Box>
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button 
              variant="ghost" 
              mr={3} 
              onClick={handleClose}
              isDisabled={loading}
            >
              Cancel
            </Button>
            <Button
              leftIcon={loading ? <Spinner size="sm" /> : <DownloadCloud size={18} />}
              colorScheme="purple"
              onClick={handleSeed}
              isLoading={loading}
              loadingText="Importing..."
            >
              Import Voices
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default SeedVoicesButton;