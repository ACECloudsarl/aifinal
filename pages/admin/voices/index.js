// pages/admin/voices/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  Badge,
  HStack,
  VStack,
  Tooltip,
  useColorModeValue,
  Flex,
  Heading,
  useToast
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  AddIcon, 
  RepeatIcon, 
  EditIcon, 
  DeleteIcon 
} from '@chakra-ui/icons';
import { Volume2, VolumeX } from 'lucide-react';
import AdminLayout from '@/adm_components/AdminLayout';
import SeedVoicesButton from '@/adm_components/SeedVoicesButton';
import withAuth from '../../../lib/withAuth';
import voiceService from '@/lib/VoiceService';

function AdminVoices() {
  const router = useRouter();
  const toast = useToast();
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  
  // Colors
  const bgTable = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  const fetchVoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/voices');
      
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      const data = await response.json();
      setVoices(data);
    } catch (error) {
      console.error('Error fetching voices:', error);
      setError('Failed to load voices. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchVoices();
    
    // Initialize voice service
    voiceService.initialize();
    
    // Set up voice playing/stopped event listeners
    const unsubscribeStopped = voiceService.subscribeToStopped(() => {
      setPlayingVoiceId(null);
    });
    
    return () => {
      unsubscribeStopped();
      // Stop any playing audio when component unmounts
      voiceService.stopAudio();
    };
  }, []);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredVoices = voices.filter(voice => 
    voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    voice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (voice.gender && voice.gender.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (voice.accent && voice.accent.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleEdit = (voiceId) => {
    router.push(`/admin/voices/${voiceId}`);
  };
  
  const handleDelete = async (voiceId) => {
    if (!window.confirm('Are you sure you want to delete this voice? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/voices/${voiceId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.usedBy) {
          toast({
            title: "Cannot delete voice",
            description: `This voice is in use by ${data.usedBy.bots} bots and ${data.usedBy.userSettings} user settings.`,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error('Failed to delete voice');
        }
        return;
      }
      
      // Remove the deleted voice from the state
      setVoices(voices.filter(voice => voice.id !== voiceId));
      
      toast({
        title: "Voice deleted",
        description: "The voice has been successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting voice:', error);
      toast({
        title: "Error",
        description: "Failed to delete voice. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handlePreviewVoice = async (voice) => {
    if (playingVoiceId) {
      voiceService.stopAudio();
      setPlayingVoiceId(null);
      return;
    }
    
    try {
      setPlayingVoiceId(voice.id);
      const previewText = voice.previewText || `Hello, I'm ${voice.name}. ${voice.description}`;
      await voiceService.speak(previewText, voice.id);
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setPlayingVoiceId(null);
      
      toast({
        title: "Error",
        description: "Failed to play voice preview.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  return (
    <AdminLayout title="Voice Management">
      <Box mb={5}>
        <Flex justify="space-between" wrap="wrap" gap={3} mb={4}>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search voices..."
              value={searchQuery}
              onChange={handleSearch}
              bg={useColorModeValue('white', 'gray.800')}
            />
          </InputGroup>
          
          <HStack spacing={3}>
            <Button 
              leftIcon={<RepeatIcon />}
              variant="outline" 
              onClick={fetchVoices}
            >
              Refresh
            </Button>
            
            <SeedVoicesButton onSeedComplete={() => fetchVoices()} />
            
            <Button 
              colorScheme="purple" 
              leftIcon={<AddIcon />}
              onClick={() => router.push('/admin/voices/new')}
            >
              Add Voice
            </Button>
          </HStack>
        </Flex>
        
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}
      </Box>
      
      {loading ? (
        <Flex justify="center" align="center" py={10}>
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" color="purple.500" />
            <Text>Loading voices...</Text>
          </VStack>
        </Flex>
      ) : (
        <Box
          borderWidth="1px"
          borderStyle="solid"
          borderColor={borderColor}
          borderRadius="md"
          overflow="auto"
          bg={bgTable}
          maxH="calc(100vh - 220px)"
        >
          <Table variant="simple">
            <Thead position="sticky" top={0} bg={bgTable} zIndex={1}>
              <Tr>
                <Th width="50px">#</Th>
                <Th width="200px">Voice</Th>
                <Th>Description</Th>
                <Th width="150px">Languages</Th>
                <Th width="100px">Status</Th>
                <Th width="150px" textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredVoices.length === 0 ? (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Text fontSize="lg" fontWeight="medium">No voices found</Text>
                    <Text color="gray.500" mt={2}>Try a different search term or add a new voice</Text>
                  </Td>
                </Tr>
              ) : (
                filteredVoices.map((voice, index) => (
                  <Tr 
                    key={voice.id}
                    _hover={{ bg: hoverBg }}
                  >
                    <Td>{index + 1}</Td>
                    <Td>
                      <HStack spacing={2} align="center">
                        {voice.flag && (
                          <Text fontSize="xl">{voice.flag}</Text>
                        )}
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{voice.name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {voice.gender && `${voice.gender}`}{voice.gender && voice.accent && ', '}{voice.accent}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <Text noOfLines={2} maxW="300px">
                        {voice.description}
                      </Text>
                      {voice.externalId && (
                        <Text fontSize="xs" color="gray.500" fontFamily="mono">
                          ID: {voice.externalId.substring(0, 20)}...
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <Flex wrap="wrap" gap={1}>
                        {voice.languages && voice.languages.length > 0 ? (
                          voice.languages.map(lang => (
                            <Badge key={lang} colorScheme="purple" variant="subtle">
                              {lang.toUpperCase()}
                            </Badge>
                          ))
                        ) : (
                          <Text fontSize="xs" color="gray.500">
                            No languages specified
                          </Text>
                        )}
                      </Flex>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={voice.isActive ? "green" : "gray"}
                      >
                        {voice.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2} justify="center">
                        <Tooltip label="Preview voice">
                          <IconButton
                            colorScheme={playingVoiceId === voice.id ? "red" : "purple"}
                            variant="outline"
                            size="sm"
                            icon={playingVoiceId === voice.id ? 
                              <VolumeX size={18} /> : 
                              <Volume2 size={18} />
                            }
                            onClick={() => handlePreviewVoice(voice)}
                            aria-label="Preview voice"
                          />
                        </Tooltip>
                        
                        <Tooltip label="Edit voice">
                          <IconButton 
                            colorScheme="blue"
                            variant="outline"
                            size="sm"
                            icon={<EditIcon />}
                            onClick={() => handleEdit(voice.id)}
                            aria-label="Edit voice"
                          />
                        </Tooltip>
                        
                        <Tooltip label="Delete voice">
                          <IconButton 
                            colorScheme="red"
                            variant="outline"
                            size="sm"
                            icon={<DeleteIcon />}
                            onClick={() => handleDelete(voice.id)}
                            aria-label="Delete voice"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </AdminLayout>
  );
}

export default withAuth(AdminVoices);