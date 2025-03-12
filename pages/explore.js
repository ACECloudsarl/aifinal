// pages/explore.js

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Input,
  Container,
  Box,
  CircularProgress,
  Alert,
} from '@mui/joy';
import { Search } from 'lucide-react';
import Layout from '../components/layout/Layout';
import BotList from '../components/bots/BotList';
import withAuth from '../lib/withAuth';

function Explore() {
  const { t } = useTranslation();
  const [featuredBots, setFeaturedBots] = useState([]);
  const [popularBots, setPopularBots] = useState([]);
  const [recentChatsMap, setRecentChatsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bots
        const botsResponse = await fetch('/api/bots');
        
        if (!botsResponse.ok) {
          throw new Error('Failed to fetch bots');
        }
        
        const botsData = await botsResponse.json();
        
        // Fetch recent chats for all bots
        const recentChatsResponse = await fetch('/api/chats/recent-by-bot');
        
        if (!recentChatsResponse.ok) {
          throw new Error('Failed to fetch recent chats');
        }
        
        const recentChatsData = await recentChatsResponse.json();
        setRecentChatsMap(recentChatsData);
        
        // Filter and categorize bots
        const filtered = searchQuery
          ? botsData.filter(bot => 
              bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              bot.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : botsData;
        
        // For demo purposes, split bots into featured and popular
        // In a real app, you might have a 'featured' field in the database
        const featured = filtered.slice(0, 4);
        const popular = filtered.slice(4);
        
        setFeaturedBots(featured);
        setPopularBots(popular);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load bots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchQuery]);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  if (isLoading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <Container maxWidth="lg">
        {error && (
          <Alert color="danger" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Typography level="h3" sx={{ mb: 2 }}>
            {t('explore.title')}
          </Typography>
          <Input
            fullWidth
            startDecorator={<Search />}
            placeholder={t('explore.search')}
            value={searchQuery}
            onChange={handleSearch}
            sx={{ mb: 4 }}
          />
        </Box>
        
        {featuredBots.length > 0 && (
          <BotList 
            bots={featuredBots} 
            title={t('explore.featured')} 
            recentChatsMap={recentChatsMap}
          />
        )}
        
        {popularBots.length > 0 && (
          <BotList 
            bots={popularBots} 
            title={t('explore.popular')} 
            recentChatsMap={recentChatsMap}
          />
        )}
        
        {featuredBots.length === 0 && popularBots.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography level="h5">No bots match your search</Typography>
            <Typography level="body-md" sx={{ mt: 1, color: 'text.secondary' }}>
              Try a different search term or browse all bots
            </Typography>
          </Box>
        )}
      </Container>
    </Layout>
  );
}

export default withAuth(Explore);