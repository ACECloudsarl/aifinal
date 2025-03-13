// pages/admin/voices/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Table,
  Typography,
  Sheet,
  Button,
  Input,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
  Divider,
  Badge,
} from '@mui/joy';
import { Plus, Edit, Trash2, Search, RefreshCcw, Volume2, VolumeX } from 'lucide-react';
import AdminLayout from '@/adm_components/AdminLayout';
import SeedVoicesButton from '@/adm_components/SeedVoicesButton';
import withAuth from '../../../lib/withAuth';
import voiceService from '@/lib/VoiceService';

function AdminVoices() {
  const router = useRouter();
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  
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
    if (!confirm('Are you sure you want to delete this voice? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/voices/${voiceId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.usedBy) {
          alert(`Cannot delete voice that is in use by ${data.usedBy.bots} bots and ${data.usedBy.userSettings} user settings.`);
        } else {
          throw new Error('Failed to delete voice');
        }
        return;
      }
      
      // Remove the deleted voice from the state
      setVoices(voices.filter(voice => voice.id !== voiceId));
    } catch (error) {
      console.error('Error deleting voice:', error);
      alert('Failed to delete voice. Please try again.');
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
      const text = voice.previewText || `Hello, this is the ${voice.name} voice. I hope you like how I sound.`;
      await voiceService.speak(text, voice.id);
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setPlayingVoiceId(null);
    }
  };
  
  return (
    <AdminLayout title="Voice Management">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Input
            placeholder="Search voices..."
            startDecorator={<Search size={18} />}
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: 300 }}
          />
          <Button 
            variant="outlined" 
            color="neutral" 
            startDecorator={<RefreshCcw size={18} />}
            onClick={fetchVoices}
          >
            Refresh
          </Button>
          
          <SeedVoicesButton onSeedComplete={() => fetchVoices()} />
        </Box>
        
        <Button 
          color="primary" 
          startDecorator={<Plus size={18} />}
          onClick={() => router.push('/admin/voices/new')}
        >
          Add Voice
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="danger" sx={{ p: 2 }}>
          {error}
        </Typography>
      ) : (
        <Sheet
          variant="outlined"
          sx={{ 
            borderRadius: 'md', 
            overflow: 'auto',
            maxHeight: 'calc(100vh - 250px)'
          }}
        >
          <Table stickyHeader>
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th style={{ width: 200 }}>Voice</th>
                <th>Description</th>
                <th style={{ width: 150 }}>Languages</th>
                <th style={{ width: 100 }}>Status</th>
                <th style={{ width: 150 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Typography level="body-lg">No voices found</Typography>
                  </td>
                </tr>
              ) : (
                filteredVoices.map((voice, index) => (
                  <tr key={voice.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {voice.flag && (
                          <Typography fontSize="xl">{voice.flag}</Typography>
                        )}
                        <Box>
                          <Typography fontWeight="md">{voice.name}</Typography>
                          <Typography level="body-xs" color="neutral">
                            {voice.gender && `${voice.gender}`}{voice.gender && voice.accent && ', '}{voice.accent}
                          </Typography>
                        </Box>
                      </Box>
                    </td>
                    <td>
                      <Typography noWrap sx={{ maxWidth: 300 }}>
                        {voice.description}
                      </Typography>
                      {voice.externalId && (
                        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                          ID: {voice.externalId}
                        </Typography>
                      )}
                    </td>
                    <td>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {voice.languages && voice.languages.map(lang => (
                          <Chip key={lang} size="sm" variant="soft" color="primary">
                            {lang}
                          </Chip>
                        ))}
                        {(!voice.languages || voice.languages.length === 0) && (
                          <Typography level="body-xs" color="neutral">
                            No languages specified
                          </Typography>
                        )}
                      </Box>
                    </td>
                    <td>
                      <Chip
                        variant="soft"
                        color={voice.isActive ? "success" : "neutral"}
                        size="sm"
                      >
                        {voice.isActive ? "Active" : "Inactive"}
                      </Chip>
                    </td>
                    <td>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Preview">
                          <IconButton
                            variant="plain"
                            color={playingVoiceId === voice.id ? "primary" : "neutral"}
                            size="sm"
                            onClick={() => handlePreviewVoice(voice)}
                          >
                            {playingVoiceId === voice.id ? (
                              <VolumeX size={18} />
                            ) : (
                              <Volume2 size={18} />
                            )}
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit">
                          <IconButton 
                            variant="plain" 
                            color="neutral" 
                            size="sm"
                            onClick={() => handleEdit(voice.id)}
                          >
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton 
                            variant="plain" 
                            color="danger" 
                            size="sm"
                            onClick={() => handleDelete(voice.id)}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Sheet>
      )}
    </AdminLayout>
  );
}

export default withAuth(AdminVoices);