// components/settings/VoiceSettings.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Option,
  Stack,
  Slider,
  Button,
  Alert,
  Divider,
  CircularProgress,
  IconButton,
} from '@mui/joy';
import { Volume2, PlayCircle, StopCircle, Languages, Mic, Globe, Repeat, Info } from 'lucide-react';
import voiceService from '@/lib/VoiceService';

const VoiceSettings = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    autoTTS: false,
    preferredVoiceId: null,
    speakingRate: 1.0,
    speakingPitch: 1.0,
    inputDetectLanguage: true,
    preferredLanguage: 'en',
  });
  
  const [voices, setVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewText, setPreviewText] = useState('');

  // Load data on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Initialize voice service
        await voiceService.initialize();
        
        // Load voices
        const voicesData = await voiceService.loadVoices();
        if (isMounted) {
          setVoices(voicesData);
        }
        
        // Load user settings
        const userSettings = await voiceService.loadUserSettings();
        if (isMounted && userSettings) {
          setSettings(userSettings);
        }
      } catch (error) {
        console.error('Error loading voice data:', error);
        if (isMounted) {
          setError('Failed to load voice settings. Please try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    // Set up event listeners for speech
    const unsubscribePlaying = voiceService.subscribeToPlaying(() => {
      if (isMounted) setIsPlaying(true);
    });
    
    const unsubscribeStopped = voiceService.subscribeToStopped(() => {
      if (isMounted) setIsPlaying(false);
    });
    
    return () => {
      isMounted = false;
      unsubscribePlaying();
      unsubscribeStopped();
      
      // Stop any playing audio when component unmounts
      if (isPlaying) {
        voiceService.stopAudio();
      }
    };
  }, []);
  
  // Update preview text when voice changes
  useEffect(() => {
    if (settings.preferredVoiceId && voices.length > 0) {
      const selectedVoice = voices.find(v => v.id === settings.preferredVoiceId);
      if (selectedVoice) {
        setPreviewText(selectedVoice.previewText || 'Hello, this is a preview of my voice.');
      }
    }
  }, [settings.preferredVoiceId, voices]);

  // Handle form changes
  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (field) => (_, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Handle slider changes
  const handleSliderChange = (field) => (_, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Save settings
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const success = await voiceService.saveUserSettings(settings);
      
      if (success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving voice settings:', error);
      setError('An error occurred while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Test voice
  const handleTestVoice = async () => {
    if (isPlaying) {
      voiceService.stopAudio();
      return;
    }
    
    const text = previewText || 'This is a test of the text-to-speech system with the selected voice.';
    
    try {
      await voiceService.speak(text, settings.preferredVoiceId, {
        speakingRate: settings.speakingRate,
        speakingPitch: settings.speakingPitch,
      });
    } catch (error) {
      console.error('Error testing voice:', error);
      setError('Failed to test voice. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, flexDirection: 'column', gap: 2 }}>
            <CircularProgress />
            <Typography textAlign="center">
              Loading voice settings...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography level="title-lg" startDecorator={<Volume2 />} sx={{ mb: 3 }}>
          Voice Settings
        </Typography>

        {error && (
          <Alert color="danger" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert color="success" sx={{ mb: 2 }}>
            Settings saved successfully!
          </Alert>
        )}

        <Stack spacing={3}>
          <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between' }}>
            <Box>
              <FormLabel>Auto Text-to-Speech</FormLabel>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Automatically read AI responses aloud
              </Typography>
            </Box>
            <Switch
              checked={settings.autoTTS}
              onChange={handleChange('autoTTS')}
              color="primary"
            />
          </FormControl>

          <Divider />

          <FormControl>
            <FormLabel>Voice Selection</FormLabel>
            <Select
              value={settings.preferredVoiceId || ''}
              onChange={handleSelectChange('preferredVoiceId')}
              placeholder="Select a voice"
              startDecorator={<Volume2 size={16} />}
              endDecorator={
                settings.preferredVoiceId && (
                  <IconButton 
                    size="sm" 
                    variant="soft" 
                    color={isPlaying ? "danger" : "primary"}
                    onClick={handleTestVoice}
                  >
                    {isPlaying ? <StopCircle size={16} /> : <PlayCircle size={16} />}
                  </IconButton>
                )
              }
            >
              {voices.map((voice) => (
                <Option 
                  key={voice.id} 
                  value={voice.id}
                  startDecorator={voice.flag ? voice.flag : null}
                >
                  {voice.name} - {voice.description}
                </Option>
              ))}
            </Select>
            <Typography level="body-sm" sx={{ mt: 1, color: 'text.secondary' }}>
              Choose a voice for the AI assistant
            </Typography>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Speaking Rate</FormLabel>
              <Slider
                value={settings.speakingRate}
                onChange={handleSliderChange('speakingRate')}
                min={0.5}
                max={2.0}
                step={0.1}
                marks={[
                  { value: 0.5, label: 'Slow' },
                  { value: 1.0, label: 'Normal' },
                  { value: 2.0, label: 'Fast' },
                ]}
                valueLabelDisplay="auto"
                startDecorator={<Repeat size={16} />}
              />
            </FormControl>

            <FormControl sx={{ flex: 1 }}>
              <FormLabel>Voice Pitch</FormLabel>
              <Slider
                value={settings.speakingPitch}
                onChange={handleSliderChange('speakingPitch')}
                min={0.5}
                max={1.5}
                step={0.1}
                marks={[
                  { value: 0.5, label: 'Low' },
                  { value: 1.0, label: 'Normal' },
                  { value: 1.5, label: 'High' },
                ]}
                valueLabelDisplay="auto"
                startDecorator={<Volume2 size={16} />}
              />
            </FormControl>
          </Box>

          <Divider />

          <FormControl orientation="horizontal" sx={{ justifyContent: 'space-between' }}>
            <Box>
              <FormLabel>Detect Input Language</FormLabel>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                Automatically detect the language of your voice input
              </Typography>
            </Box>
            <Switch
              checked={settings.inputDetectLanguage}
              onChange={handleChange('inputDetectLanguage')}
              color="primary"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Preferred Language</FormLabel>
            <Select
              value={settings.preferredLanguage}
              onChange={handleSelectChange('preferredLanguage')}
              startDecorator={<Globe size={16} />}
            >
              <Option value="en">English</Option>
              <Option value="ar">Arabic</Option>
              <Option value="fr">French</Option>
              <Option value="de">German</Option>
              <Option value="it">Italian</Option>
              <Option value="es">Spanish</Option>
              <Option value="ro">Romanian</Option>
              <Option value="pt">Portuguese</Option>
            </Select>
            <Typography level="body-sm" sx={{ mt: 1, color: 'text.secondary' }}>
              Used when language detection is disabled
            </Typography>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              color="neutral"
              startDecorator={isPlaying ? <StopCircle /> : <PlayCircle />}
              onClick={handleTestVoice}
              sx={{ flex: 1 }}
            >
              {isPlaying ? 'Stop Test' : 'Test Voice'}
            </Button>
            <Button
              loading={isSaving}
              onClick={handleSave}
              sx={{ flex: 1 }}
            >
              Save Settings
            </Button>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VoiceSettings;