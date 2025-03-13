// pages/admin/voices/[voiceId].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Checkbox,
  Flex,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  HStack,
  VStack,
  IconButton,
  Tooltip,
  useColorModeValue,
  Divider,
  useToast
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckIcon } from '@chakra-ui/icons';
import { Volume2, VolumeX, User, Languages, Flag } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import withAuth from '../../../lib/withAuth';
import voiceService from '@/lib/VoiceService';

// Available language options
const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ro', name: 'Romanian' },
];

// Gender options
const genderOptions = ['Male', 'Female', 'Non-binary', 'Other'];

// Age group options
const ageOptions = ['Child', 'Teen', 'Young Adult', 'Adult', 'Senior'];

// Accent options
const accentOptions = [
  'American', 'British', 'Australian', 'Indian',
  'Scottish', 'Irish', 'South African', 'Canadian',
  'German', 'French', 'Italian', 'Spanish', 'Russian',
  'Middle Eastern', 'Other'
];

// Flag emojis for common languages
const flagEmojis = {
  'en': '🇬🇧',
  'us': '🇺🇸',
  'fr': '🇫🇷',
  'es': '🇪🇸',
  'de': '🇩🇪',
  'it': '🇮🇹',
  'pt': '🇵🇹',
  'nl': '🇳🇱',
  'pl': '🇵🇱',
  'ru': '🇷🇺',
  'ja': '🇯🇵',
  'zh': '🇨🇳',
  'ar': '🇸🇦',
  'hi': '🇮🇳',
  'ro': '🇷🇴',
};

function AdminVoiceEdit() {
  const router = useRouter();
  const toast = useToast();
  const { voiceId } = router.query;
  const isNewVoice = voiceId === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  
  const [voiceData, setVoiceData] = useState({
    name: '',
    externalId: '',
    description: '',
    gender: '',
    accent: '',
    age: '',
    previewText: 'Hello, this is a demonstration of my voice. I hope you like how I sound.',
    languages: [],
    preview: '',
    flag: '',
    isActive: true,
  });
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tagActiveBg = useColorModeValue('purple.100', 'purple.900');
  const tagActiveColor = useColorModeValue('purple.700', 'purple.200');
  
  // Initialize voice service and load voice data
  useEffect(() => {
    voiceService.initialize();
    
    const unsubscribePlaying = voiceService.subscribeToPlaying(() => {
      setIsPlaying(true);
    });
    
    const unsubscribeStopped = voiceService.subscribeToStopped(() => {
      setIsPlaying(false);
    });
    
    // Fetch voice data if editing an existing voice
    if (router.isReady) {
      if (!isNewVoice) {
        fetchVoiceData();
      } else {
        setLoading(false);
      }
    }
    
    return () => {
      unsubscribePlaying();
      unsubscribeStopped();
      
      // Stop any playing audio when component unmounts
      if (isPlaying) {
        voiceService.stopAudio();
      }
    };
  }, [router.isReady, voiceId, isNewVoice]);
  
  const fetchVoiceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/voices/${voiceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch voice data');
      }
      
      const data = await response.json();
      setVoiceData(data);
    } catch (error) {
      console.error('Error fetching voice:', error);
      setError('Failed to load voice data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setVoiceData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setVoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLanguageToggle = (langCode) => {
    const currentLangs = voiceData.languages || [];
    const newLangs = currentLangs.includes(langCode)
      ? currentLangs.filter(l => l !== langCode)
      : [...currentLangs, langCode];
    
    setVoiceData(prev => ({
      ...prev,
      languages: newLangs
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const url = isNewVoice 
        ? '/api/admin/voices' 
        : `/api/admin/voices/${voiceId}`;
      
      const method = isNewVoice ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(voiceData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save voice');
      }
      
      const savedVoice = await response.json();
      
      toast({
        title: isNewVoice ? "Voice created" : "Voice updated",
        description: isNewVoice ? "New voice has been created successfully" : "Voice has been updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      if (isNewVoice) {
        // Redirect to edit page for the newly created voice
        router.push(`/admin/voices/${savedVoice.id}`);
      } else {
        // Update the form with the latest data
        setVoiceData(savedVoice);
      }
    } catch (error) {
      console.error('Error saving voice:', error);
      setError(error.message || 'Failed to save voice. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePreviewVoice = async () => {
    if (isPlaying) {
      voiceService.stopAudio();
      return;
    }
    
    try {
      await voiceService.speak(voiceData.previewText, voiceData.id);
    } catch (error) {
      console.error('Error playing voice preview:', error);
      toast({
        title: "Error",
        description: "Failed to play voice preview",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (loading) {
    return (
      <AdminLayout title={isNewVoice ? 'Add New Voice' : 'Edit Voice'}>
        <Flex justify="center" align="center" minH="300px">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" color="purple.500" />
            <Text>Loading voice data...</Text>
          </VStack>
        </Flex>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={isNewVoice ? 'Add New Voice' : `Edit Voice: ${voiceData.name}`}>
      <Box mb={5}>
        <Button 
          leftIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/admin/voices')}
          variant="outline"
        >
          Back to Voices List
        </Button>
      </Box>
      
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card variant="outline" bg={cardBg} mb={5}>
          <CardBody p={0}>
            <Tabs 
              colorScheme="purple" 
              size="md" 
              index={tabIndex} 
              onChange={setTabIndex}
            >
              <TabList px={4}>
                <Tab>
                  <HStack spacing={2}>
                    <User size={16} />
                    <Text>Basic Info</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Languages size={16} />
                    <Text>Languages</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Volume2 size={16} />
                    <Text>Preview</Text>
                  </HStack>
                </Tab>
              </TabList>
              
              <TabPanels p={0}>
                {/* Basic Info Panel */}
                <TabPanel p={5}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Voice Name</FormLabel>
                      <Input
                        name="name"
                        value={voiceData.name}
                        onChange={handleChange}
                        placeholder="Enter voice name"
                      />
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>External ID (from ElevenLabs)</FormLabel>
                      <Input
                        name="externalId"
                        value={voiceData.externalId || ''}
                        onChange={handleChange}
                        placeholder="Enter external voice ID (optional)"
                      />
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Leave empty if this is a custom voice
                      </Text>
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        name="description"
                        value={voiceData.description}
                        onChange={handleChange}
                        placeholder="Enter voice description"
                        minH="100px"
                      />
                    </FormControl>
                    
                    <Flex gap={4} wrap={{ base: "wrap", md: "nowrap" }}>
                      <FormControl flex={{ base: '100%', md: '1' }}>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          name="gender"
                          value={voiceData.gender || ''}
                          onChange={handleChange}
                          placeholder="Select gender"
                        >
                          {genderOptions.map(gender => (
                            <option key={gender} value={gender}>
                              {gender}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl flex={{ base: '100%', md: '1' }}>
                        <FormLabel>Age Group</FormLabel>
                        <Select
                          name="age"
                          value={voiceData.age || ''}
                          onChange={handleChange}
                          placeholder="Select age group"
                        >
                          {ageOptions.map(age => (
                            <option key={age} value={age}>
                              {age}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </Flex>
                    
                    <FormControl>
                      <FormLabel>Accent</FormLabel>
                      <Select
                        name="accent"
                        value={voiceData.accent || ''}
                        onChange={handleChange}
                        placeholder="Select accent"
                      >
                        {accentOptions.map(accent => (
                          <option key={accent} value={accent}>
                            {accent}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Flag Emoji</FormLabel>
                      <Wrap spacing={2} mt={2} mb={3}>
                        {Object.entries(flagEmojis).map(([code, emoji]) => (
                          <WrapItem key={code}>
                            <Tag
                              size="lg"
                              cursor="pointer"
                              variant={voiceData.flag === emoji ? "solid" : "subtle"}
                              colorScheme={voiceData.flag === emoji ? "purple" : "gray"}
                              onClick={() => handleSelectChange('flag', emoji)}
                              fontFamily="system-ui"
                            >
                              <TagLabel>{emoji} {code.toUpperCase()}</TagLabel>
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                      
                      <HStack>
                        <Text fontSize="sm" color="gray.500">Custom flag:</Text>
                        <Input
                          name="flag"
                          value={voiceData.flag || ''}
                          onChange={handleChange}
                          placeholder="🎙️"
                          maxW="100px"
                          fontFamily="system-ui"
                          fontSize="lg"
                        />
                      </HStack>
                    </FormControl>
                    
                    <FormControl display="flex" alignItems="center">
                      <Checkbox
                        id="isActive"
                        name="isActive"
                        isChecked={voiceData.isActive}
                        onChange={handleCheckboxChange}
                        colorScheme="green"
                      />
                      <FormLabel htmlFor="isActive" mb="0" ml={2}>
                        Voice Active
                      </FormLabel>
                    </FormControl>
                  </VStack>
                </TabPanel>
                
                {/* Languages Panel */}
                <TabPanel p={5}>
                  <VStack spacing={4} align="stretch">
                    <Text>Select languages supported by this voice:</Text>
                    
                    <Wrap spacing={2}>
                      {languageOptions.map(lang => (
                        <WrapItem key={lang.code}>
                          <Tag
                            size="lg"
                            cursor="pointer"
                            fontWeight="medium"
                            bg={voiceData.languages?.includes(lang.code) ? tagActiveBg : undefined}
                            color={voiceData.languages?.includes(lang.code) ? tagActiveColor : undefined}
                            variant={voiceData.languages?.includes(lang.code) ? "solid" : "subtle"}
                            colorScheme={voiceData.languages?.includes(lang.code) ? "purple" : "gray"}
                            onClick={() => handleLanguageToggle(lang.code)}
                          >
                            <TagLabel>
                              {flagEmojis[lang.code] && `${flagEmojis[lang.code]} `}
                              {lang.name}
                              {voiceData.languages?.includes(lang.code) && (
                                <Box as="span" ml={1}>
                                  <CheckIcon boxSize={3} />
                                </Box>
                              )}
                            </TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                    
                    {voiceData.languages?.length > 0 && (
                      <Box mt={4}>
                        <Text fontWeight="medium" mb={2}>Selected Languages:</Text>
                        <Wrap>
                          {voiceData.languages.map(code => {
                            const lang = languageOptions.find(l => l.code === code);
                            return (
                              <WrapItem key={code}>
                                <Tag 
                                  colorScheme="purple" 
                                  variant="solid"
                                  size="md"
                                >
                                  {flagEmojis[code] && `${flagEmojis[code]} `}
                                  {lang ? lang.name : code.toUpperCase()}
                                </Tag>
                              </WrapItem>
                            );
                          })}
                        </Wrap>
                      </Box>
                    )}
                    
                    {voiceData.languages?.length === 0 && (
                      <Alert status="info" mt={4}>
                        <AlertIcon />
                        <Text>No languages selected. This voice will be available for all languages.</Text>
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>
                
                {/* Preview Panel */}
                <TabPanel p={5}>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel>Preview Text</FormLabel>
                      <Textarea
                        name="previewText"
                        value={voiceData.previewText || ''}
                        onChange={handleChange}
                        placeholder="Enter text to be used for previewing this voice"
                        minH="150px"
                      />
                    </FormControl>
                    
                    <Button
                      leftIcon={isPlaying ? <VolumeX size={18} /> : <Volume2 size={18} />}
                      colorScheme={isPlaying ? "red" : "purple"}
                      onClick={handlePreviewVoice}
                      isDisabled={!voiceData.previewText}
                      alignSelf="flex-end"
                    >
                      {isPlaying ? "Stop Preview" : "Play Preview"}
                    </Button>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
        
        <Flex justify="space-between" mt={6}>
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/voices')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            colorScheme="purple"
            isLoading={saving}
            loadingText="Saving..."
          >
            {isNewVoice ? "Create Voice" : "Save Changes"}
          </Button>
        </Flex>
      </form>
    </AdminLayout>
  );
}

export default withAuth(AdminVoiceEdit);