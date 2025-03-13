// pages/admin/bots/[botId].js - Modified to add voice selection
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
  Option,
  Card,
  Sheet,
  Typography,
  CircularProgress,
  Divider,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Alert,
  AspectRatio,
  IconButton,
} from '@mui/joy';
import { Save, ArrowLeft, Image, Bot, FileText, Cpu, Volume2, VolumeX } from 'lucide-react';
import AdminLayout from '@/adm_components/AdminLayout';
import withAuth from '../../../lib/withAuth';
import voiceService from '../../../services/VoiceService';

const modelOptions = [
  { value: "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free", label: "Llama 3.3 70B (Advanced)" },
  { value: "meta-llama/Llama-3.3-8B-Instruct-Turbo-Free", label: "Llama 3.3 8B (Standard)" },
  { value: "mistralai/Mixtral-8x7B-Instruct-v0.1", label: "Mixtral 8x7B" },
  { value: "mistralai/Mistral-7B-Instruct-v0.2", label: "Mistral 7B" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (If integrated)" },
];

const categoryOptions = [
  "Horror", "Professional", "Food", "Fashion", "Art", "Health", 
  "Gaming", "Programming", "Business", "Wellness", "Education",
  "Entertainment", "Relationships", "Creative", "Comedy"
];

function AdminBotEdit() {
  const router = useRouter();
  const { botId } = router.query;
  const isNewBot = botId === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [voices, setVoices] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [botData, setBotData] = useState({
    name: '',
    description: '',
    avatar: '/images/default-bot.png',
    model: 'meta-llama/Llama-3.3-8B-Instruct-Turbo-Free',
    category: 'Education',
    prompt: 'You are a helpful AI assistant.',
    voiceId: null,
  });
  
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
  }, [router.isReady, botId]);
  
  // Load available voices
  useEffect(() => {
    const loadVoices = async () => {
      try {
        const voicesData = await voiceService.loadVoices();
        setVoices(voicesData);
      } catch (error) {
        console.error('Error loading voices:', error);
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
    setSuccessMessage(null);
    
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
      
      if (isNewBot) {
        // Redirect to edit page for the newly created bot
        router.push(`/admin/bots/${savedBot.id}`);
      } else {
        // Update the form with the latest data
        setBotData(savedBot);
        // Show success message
        setSuccessMessage('Bot saved successfully');
        // Automatically hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
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
    }
  };
  
  if (loading) {
    return (
      <AdminLayout title={isNewBot ? 'Add New Bot' : 'Edit Bot'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={isNewBot ? 'Add New Bot' : `Edit Bot: ${botData.name}`}>
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="outlined" 
          color="neutral" 
          startDecorator={<ArrowLeft size={18} />}
          onClick={() => router.push('/admin/bots')}
        >
          Back to Bots List
        </Button>
      </Box>
      
      {error && (
        <Alert color="danger" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert color="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Tabs defaultValue="basic">
            <TabList>
              <Tab value="basic" startDecorator={<Bot />}>Basic Info</Tab>
              <Tab value="appearance" startDecorator={<Image />}>Appearance</Tab>
              <Tab value="model" startDecorator={<Cpu />}>Model & AI</Tab>
              <Tab value="voice" startDecorator={<Volume2 />}>Voice</Tab>
              <Tab value="prompt" startDecorator={<FileText />}>Prompt</Tab>
            </TabList>
            
            <Sheet
              variant="outlined"
              sx={{ 
                mt: 2, 
                p: 3, 
                borderRadius: 'md',
              }}
            >
              <TabPanel value="basic">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl required>
                    <FormLabel>Bot Name</FormLabel>
                    <Input
                      name="name"
                      value={botData.name}
                      onChange={handleChange}
                      placeholder="Enter bot name"
                    />
                  </FormControl>
                  
                  <FormControl required>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={botData.description}
                      onChange={handleChange}
                      placeholder="Enter bot description"
                      minRows={3}
                      maxRows={5}
                    />
                  </FormControl>
                  
                  <FormControl required>
                    <FormLabel>Category</FormLabel>
                    <Select
                      name="category"
                      value={botData.category}
                      onChange={(_, value) => handleSelectChange('category', value)}
                    >
                      {categoryOptions.map(category => (
                        <Option key={category} value={category}>
                          {category}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </TabPanel>
              
              <TabPanel value="appearance">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl required>
                    <FormLabel>Avatar URL</FormLabel>
                    <Input
                      name="avatar"
                      value={botData.avatar}
                      onChange={handleChange}
                      placeholder="Enter avatar URL or path"
                    />
                  </FormControl>
                  
                  <Typography level="body-sm" sx={{ mb: 1 }}>
                    Preview:
                  </Typography>
                  
                  <Box sx={{ width: 100, height: 100 }}>
                    <AspectRatio
                      ratio="1/1"
                      sx={{ 
                        width: 100, 
                        borderRadius: 'md',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <img
                        src={botData.avatar}
                        alt="Bot avatar preview"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = '/images/default-bot.png';
                        }}
                      />
                    </AspectRatio>
                  </Box>
                </Box>
              </TabPanel>
              
              <TabPanel value="model">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl required>
                    <FormLabel>AI Model</FormLabel>
                    <Select
                      name="model"
                      value={botData.model}
                      onChange={(_, value) => handleSelectChange('model', value)}
                    >
                      {modelOptions.map(model => (
                        <Option key={model.value} value={model.value}>
                          {model.label}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Alert color="info" sx={{ mt: 2 }}>
                    <Typography level="body-sm">
                      The selected model will be used for all conversations with this bot.
                      Models with larger parameter sizes generally provide more advanced capabilities but may have higher latency or usage costs.
                    </Typography>
                  </Alert>
                </Box>
              </TabPanel>
              
              <TabPanel value="voice">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl>
                    <FormLabel>Default Voice</FormLabel>
                    <Select
                      name="voiceId"
                      value={botData.voiceId || ''}
                      onChange={(_, value) => handleSelectChange('voiceId', value)}
                      placeholder="Select a default voice"
                      endDecorator={
                        botData.voiceId && (
                          <IconButton
                            size="sm"
                            variant="soft"
                            color={isPlaying ? "danger" : "primary"}
                            onClick={handlePreviewVoice}
                            sx={{ mr: 1 }}
                          >
                            {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                          </IconButton>
                        )
                      }
                    >
                      <Option value="">No default voice</Option>
                      {voices.map(voice => (
                        <Option key={voice.id} value={voice.id}>
                          {voice.flag && `${voice.flag} `}{voice.name} - {voice.description}
                        </Option>
                      ))}
                    </Select>
                    <Typography level="body-sm" sx={{ mt: 1, color: 'text.tertiary' }}>
                      Setting a default voice will automatically use this voice for the bot's responses.
                      Users can still override this in their personal settings.
                    </Typography>
                  </FormControl>
                  
                  <Alert color="info" sx={{ mt: 2 }}>
                    <Typography level="body-sm">
                      Voice selection affects how the bot sounds when using text-to-speech.
                      Choose a voice that matches the bot's personality and purpose.
                    </Typography>
                  </Alert>
                  
                  {voices.length === 0 && (
                    <Alert color="warning">
                      <Typography level="body-sm">
                        No voices available. Please add voices in the Voice Management section.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              </TabPanel>
              
              <TabPanel value="prompt">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl>
                    <FormLabel>System Prompt</FormLabel>
                    <Textarea
                      name="prompt"
                      value={botData.prompt}
                      onChange={handleChange}
                      placeholder="Enter system prompt for this bot"
                      minRows={10}
                      maxRows={20}
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </FormControl>
                  
                  <Alert color="warning" sx={{ mt: 2 }}>
                    <Typography level="body-sm">
                      The system prompt defines the bot's personality, knowledge, and behavior.
                      Write detailed instructions to guide the AI on how to respond to users.
                      Our system will automatically add language handling and image generation capabilities.
                    </Typography>
                  </Alert>
                </Box>
              </TabPanel>
            </Sheet>
          </Tabs>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            color="primary"
            size="lg"
            startDecorator={<Save size={18} />}
            loading={saving}
          >
            {saving ? 'Saving...' : isNewBot ? 'Create Bot' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </AdminLayout>
  );
}

export default withAuth(AdminBotEdit);