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
  Checkbox,
  Chip,
  IconButton,
} from '@mui/joy';
import { Save, ArrowLeft, Volume2, VolumeX, User, Languages, Flag } from 'lucide-react';
import AdminLayout from '@/adm_components/AdminLayout';
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
  const { voiceId } = router.query;
  const isNewVoice = voiceId === 'new';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
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
  
  const handleMultiSelectChange = (name, values) => {
    setVoiceData(prev => ({
      ...prev,
      [name]: values
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    
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
      
      if (isNewVoice) {
        // Redirect to edit page for the newly created voice
        router.push(`/admin/voices/${savedVoice.id}`);
      } else {
        // Update the form with the latest data
        setVoiceData(savedVoice);
        // Show success message
        setSuccessMessage('Voice saved successfully');
        // Automatically hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
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
      setError('Failed to play voice preview. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <AdminLayout title={isNewVoice ? 'Add New Voice' : 'Edit Voice'}>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title={isNewVoice ? 'Add New Voice' : `Edit Voice: ${voiceData.name}`}>
      <Box sx={{ mb: 3 }}>
        <Button 
          variant="outlined" 
          color="neutral" 
          startDecorator={<ArrowLeft size={18} />}
          onClick={() => router.push('/admin/voices')}
        >
          Back to Voices List
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
              <Tab value="basic" startDecorator={<User />}>Basic Info</Tab>
              <Tab value="languages" startDecorator={<Languages />}>Languages</Tab>
              <Tab value="preview" startDecorator={<Volume2 />}>Preview</Tab>
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
                    <Typography level="body-xs" sx={{ mt: 0.5, color: 'text.tertiary' }}>
                      Leave empty if this is a custom voice
                    </Typography>
                  </FormControl>
                  
                  <FormControl required>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={voiceData.description}
                      onChange={handleChange}
                      placeholder="Enter voice description"
                      minRows={2}
                      maxRows={4}
                    />
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        name="gender"
                        value={voiceData.gender || ''}
                        onChange={(_, value) => handleSelectChange('gender', value)}
                        placeholder="Select gender"
                      >
                        {genderOptions.map(gender => (
                          <Option key={gender} value={gender}>
                            {gender}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel>Age Group</FormLabel>
                      <Select
                        name="age"
                        value={voiceData.age || ''}
                        onChange={(_, value) => handleSelectChange('age', value)}
                        placeholder="Select age group"
                      >
                        {ageOptions.map(age => (
                          <Option key={age} value={age}>
                            {age}
                          </Option>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  
                  <FormControl>
                    <FormLabel>Accent</FormLabel>
                    <Select
                      name="accent"
                      value={voiceData.accent || ''}
                      onChange={(_, value) => handleSelectChange('accent', value)}
                      placeholder="Select accent"
                    >
                      {accentOptions.map(accent => (
                        <Option key={accent} value={accent}>
                          {accent}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Flag Emoji</FormLabel>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {Object.entries(flagEmojis).map(([code, emoji]) => (
                        <Chip
                          key={code}
                          variant={voiceData.flag === emoji ? "solid" : "soft"}
                          color={voiceData.flag === emoji ? "primary" : "neutral"}
                          onClick={() => handleSelectChange('flag', emoji)}
                          sx={{ cursor: 'pointer', fontSize: '1.2rem' }}
                        >
                          {emoji} {code.toUpperCase()}
                        </Chip>
                      ))}
                    </Box>
                    <Typography level="body-xs" sx={{ mt: 1, color: 'text.tertiary' }}>
                      Or enter a custom flag emoji:
                    </Typography>
                    <Input
                      name="flag"
                      value={voiceData.flag || ''}
                      onChange={handleChange}
                      placeholder="🎙️"
                      sx={{ mt: 1, maxWidth: 100 }}
                    />
                  </FormControl>
                  
                  <FormControl orientation="horizontal">
                    <Checkbox
                      name="isActive"
                      checked={voiceData.isActive}
                      onChange={handleCheckboxChange}
                    />
                    <FormLabel>Active</FormLabel>
                  </FormControl>
                </Box>
              </TabPanel>
              
              <TabPanel value="languages">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography level="body-sm" sx={{ mb: 2 }}>
                    Select languages supported by this voice:
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {languageOptions.map(lang => (
                      <Chip
                        key={lang.code}
                        variant={voiceData.languages?.includes(lang.code) ? "solid" : "soft"}
                        color={voiceData.languages?.includes(lang.code) ? "primary" : "neutral"}
                        onClick={() => {
                          const currentLangs = voiceData.languages || [];
                          const newLangs = currentLangs.includes(lang.code)
                            ? currentLangs.filter(l => l !== lang.code)
                            : [...currentLangs, lang.code];
                          handleMultiSelectChange('languages', newLangs);
                        }}
                        sx={{ cursor: 'pointer' }}
                      >
                        {flagEmojis[lang.code] && `${flagEmojis[lang.code]} `}{lang.name}
                      </Chip>
                    ))}
                  </Box>
                </Box>
              </TabPanel>
              
              <TabPanel value="preview">
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl>
                    <FormLabel>Preview Text</FormLabel>
                    <Textarea
                      name="previewText"
                      value={voiceData.previewText}
                      onChange={handleChange}
                      placeholder="Enter text to be used for previewing this voice"
                      minRows={3}
                      maxRows={6}
                    />
                  </FormControl>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="soft"
                      color={isPlaying ? "danger" : "primary"}
                      startDecorator={isPlaying ? <VolumeX /> : <Volume2 />}
                      onClick={handlePreviewVoice}
                      disabled={!voiceData.previewText}
                    >
                      {isPlaying ? 'Stop Preview' : 'Play Preview'}
                    </Button>
                  </Box>
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
            {saving ? 'Saving...' : isNewVoice ? 'Create Voice' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </AdminLayout>
  );
}

export default withAuth(AdminVoiceEdit);