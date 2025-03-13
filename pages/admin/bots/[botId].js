// pages/admin/bots/[botId].js
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
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  VStack,
  HStack,
  Image,
  useColorModeValue,
  Divider,
  useToast,
  AspectRatio,
  IconButton,
  Tooltip
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckIcon } from '@chakra-ui/icons';
import { 
  Bot, 
  Image as ImageIcon, 
  Cpu, 
  FileText, 
  Volume2, 
  VolumeX
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import withAuth from '../../../lib/withAuth';
import voiceService from '@/lib/VoiceService';

// Model options for the bot
const modelOptions = [
  { value: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", label: "Llama 3.3 70B (Advanced)" },
  { value: "meta-llama/Llama-3.3-8B-Instruct-Turbo-Free", label: "Llama 3.3 8B (Standard)" },
  { value: "mistralai/Mixtral-8x7B-Instruct-v0.1", label: "Mixtral 8x7B" },
  { value: "mistralai/Mistral-7B-Instruct-v0.2", label: "Mistral 7B" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (If integrated)" },
];

// Category options for the bot
const categoryOptions = [
  "Horror", "Professional", "Food", "Fashion", "Art", "Health", 
  "Gaming", "Programming", "Business", "Wellness", "Education",
  "Entertainment", "Relationships", "Creative", "Comedy"
];

function AdminBotEdit() {
  const router = useRouter();
  const toast = useToast();
  const { botId } = router.query;
  const isNewBot = botId === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  
  const [botData, setBotData] = useState({
    name: '',
    description: '',
    avatar: '/images/default-bot.png',
    model: 'meta-llama/Llama-3.3-8B-Instruct-Turbo-Free',
    category: 'Education',
    prompt: 'You are a helpful AI assistant.',
    voiceId: null,
  });
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Initialize voice service and load data
  useEffect(() => {
    voiceService.initialize();
    
    const unsubscribePlaying = voiceService.subscribeToPlaying(() => {
      setIsPlaying(true);
    });
    
    const unsubscribeStopped = voiceService.subscribeToStopped(() => {
      setIsPlaying(false);
    });
    
    return () => {
      unsubscribePlaying();
      unsubscribeStopped();
      
      // Stop any playing audio when component unmounts
      if (isPlaying) {
        voiceService.stopAudio();
      }
    };
  }, []);
  
  // Fetch bot data if editing an existing bot
  useEffect(() => {
    if (router.isReady && botId && !isNewBot) {
      fetchBotData();
    } else if (router.isReady && isNewBot) {
      setLoading(false);
    }
  }, [router.isReady, botId, isNewBot]);
  
  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voicesData = await voiceService.loadVoices();
        setVoices(voicesData);
      } catch (error) {
        console.error('Error loading voices:', error);
        toast({
          title: "Error",
          description: "Failed to load voices",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    
    loadVoices();
  }, []);
  
  const fetchBotData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/admin/bots/${botId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch bot data');
      }
      
      const data = await response.json();
      setBotData(data);
    } catch (error) {
      console.error('Error fetching bot:', error);
      setError('Failed to load bot data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setBotData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name, value) => {
    setBotData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const url = isNewBot 
        ? '/api/admin/bots' 
        : `/api/admin/bots/${botId}`;
      
      const method = isNewBot ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(botData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save bot');
      }
      
      const savedBot = await response.json();
      
      toast({
        title: isNewBot ? "Bot created" : "Bot updated",
        description: isNewBot 
          ? `"${savedBot.name}" has been created successfully` 
          : `"${savedBot.name}" has been updated successfully`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      if (isNewBot) {
        // Redirect to edit page for the newly created bot
        router.push(`/admin/bots/${savedBot.id}`);
      } else {
        // Update the form with the latest data
        setBotData(savedBot);
      }
    } catch (error) {
      console.error('Error saving bot:', error);
      setError(error.message || 'Failed to save bot. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePreviewVoice = async () => {
    if (isPlaying) {
      voiceService.stopAudio();
      return;
    }
    
    if (!botData.voiceId) return;
    
    try {
      const previewText = `Hello, I'm ${botData.name}. ${botData.description}`;
      await voiceService.speak(previewText, botData.voiceId);
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
      <AdminLayout title={isNewBot ? 'Add New Bot' : 'Edit Bot'}>
        <Flex justify="center" align="center" minH="300px">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" color="purple.500" />
            <Text>Loading bot data...</Text>
          </VStack>
        </Flex>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={isNewBot ? 'Add New Bot' : `Edit Bot: ${botData.name}`}>
      <Box mb={5}>
        <Button 
          leftIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/admin/bots')}
          variant="outline"
        >
          Back to Bots List
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
                    <Bot size={16} />
                    <Text>Basic Info</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <ImageIcon size={16} />
                    <Text>Appearance</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Cpu size={16} />
                    <Text>Model & AI</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <Volume2 size={16} />
                    <Text>Voice</Text>
                  </HStack>
                </Tab>
                <Tab>
                  <HStack spacing={2}>
                    <FileText size={16} />
                    <Text>Prompt</Text>
                  </HStack>
                </Tab>
              </TabList>
              
              <TabPanels p={0}>
                {/* Basic Info Panel */}
                <TabPanel p={5}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Bot Name</FormLabel>
                      <Input
                        name="name"
                        value={botData.name}
                        onChange={handleChange}
                        placeholder="Enter bot name"
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        name="description"
                        value={botData.description}
                        onChange={handleChange}
                        placeholder="Enter bot description"
                        minH="100px"
                      />
                    </FormControl>
                    
                    <FormControl isRequired>
                      <FormLabel>Category</FormLabel>
                      <Select
                        name="category"
                        value={botData.category}
                        onChange={handleChange}
                        placeholder="Select category"
                      >
                        {categoryOptions.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  </VStack>
                </TabPanel>
                
                {/* Appearance Panel */}
                <TabPanel p={5}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Avatar URL</FormLabel>
                      <Input
                        name="avatar"
                        value={botData.avatar}
                        onChange={handleChange}
                        placeholder="Enter avatar URL or path"
                      />
                    </FormControl>
                    
                    <Box>
                      <Text mb={2}>Preview:</Text>
                      <HStack spacing={4} align="start">
                        <Box 
                          width="100px" 
                          height="100px" 
                          borderWidth="1px" 
                          borderColor={borderColor} 
                          borderRadius="md" 
                          overflow="hidden"
                        >
                          <AspectRatio ratio={1}>
                            <Image
                              src={botData.avatar}
                              alt="Bot avatar preview"
                              objectFit="cover"
                              onError={(e) => {
                                e.target.src = '/images/default-bot.png';
                              }}
                            />
                          </AspectRatio>
                        </Box>
                        
                        <Box flex="1">
                          <Text fontSize="sm" color="gray.500">
                            Avatar images should be square for best results. Recommended size: 400x400 pixels.
                          </Text>
                        </Box>
                      </HStack>
                    </Box>
                  </VStack>
                </TabPanel>
                
                {/* Model & AI Panel */}
                <TabPanel p={5}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>AI Model</FormLabel>
                      <Select
                        name="model"
                        value={botData.model}
                        onChange={handleChange}
                        placeholder="Select model"
                      >
                        {modelOptions.map(model => (
                          <option key={model.value} value={model.value}>
                            {model.label}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle mb={1}>Model Information</AlertTitle>
                        <AlertDescription fontSize="sm">
                        Voice selection affects how the bot sounds when using text-to-speech.
                        Choose a voice that matches the bot's personality and purpose.
                      </AlertDescription>
                    </Alert>
                    
                    {voices.length === 0 && (
                      <Alert status="warning" borderRadius="md">
                        <AlertIcon />
                        <AlertDescription>
                          No voices available. Please add voices in the Voice Management section.
                        </AlertDescription>
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>
                
                {/* Prompt Panel */}
                <TabPanel p={5}>
                  <VStack spacing={5} align="stretch">
                    <FormControl>
                      <FormLabel>System Prompt</FormLabel>
                      <Textarea
                        name="prompt"
                        value={botData.prompt}
                        onChange={handleChange}
                        placeholder="Enter system prompt for this bot"
                        fontFamily="mono"
                        h="300px"
                        fontSize="sm"
                      />
                    </FormControl>
                    
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>About System Prompts</AlertTitle>
                        <AlertDescription fontSize="sm">
                          The system prompt defines the bot's personality, knowledge, and behavior.
                          Write detailed instructions to guide the AI on how to respond to users.
                          Our system will automatically add language handling and image generation capabilities.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
        
        <Flex justify="space-between" mt={6}>
          <Button 
            variant="outline" 
            onClick={() => router.push('/admin/bots')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            colorScheme="purple"
            isLoading={saving}
            loadingText="Saving..."
          >
            {isNewBot ? "Create Bot" : "Save Changes"}
          </Button>
        </Flex>
      </form>
    </AdminLayout>
  );
}

export default withAuth(AdminBotEdit);  The selected model will be used for all conversations with this bot.
                          Models with larger parameter sizes generally provide more advanced capabilities but may have higher latency or usage costs.
                        </AlertDescription>
                      </Box>
                    </Alert>
                  </VStack>
                </TabPanel>
                
                {/* Voice Panel */}
                <TabPanel p={5}>
                  <VStack spacing={5} align="stretch">
                    <FormControl>
                      <FormLabel>Default Voice</FormLabel>
                      <Select
                        name="voiceId"
                        value={botData.voiceId || ''}
                        onChange={handleChange}
                        placeholder="Select a default voice"
                      >
                        <option value="">No default voice</option>
                        {voices.map(voice => (
                          <option key={voice.id} value={voice.id}>
                            {voice.flag && `${voice.flag} `}{voice.name} - {voice.description}
                          </option>
                        ))}
                      </Select>
                      
                      {botData.voiceId && (
                        <HStack mt={3}>
                          <Button
                            leftIcon={isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                            size="sm"
                            colorScheme={isPlaying ? "red" : "purple"}
                            onClick={handlePreviewVoice}
                          >
                            {isPlaying ? "Stop" : "Preview Voice"}
                          </Button>
                        </HStack>
                      )}
                      
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        Setting a default voice will automatically use this voice for the bot's responses.
                        Users can still override this in their personal settings.
                      </Text>
                    </FormControl>
                    
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <AlertDescription fontSize="sm">
                      </AlertDescription>
                      </Alert>