// pages/explore.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Input,
  InputLeftElement,
  InputGroup,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import BotList from '../components/bots/BotList';
import withAuth from '../lib/withAuth';

function Explore() {
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
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          height="70vh"
        >
          <Spinner size="xl" />
        </Box>
      </Layout>
    );
  }
  
  return (
    <Layout currentView="explore">
      <Container maxW="container.lg">
        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            <AlertTitle mr={2}>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Box mb={4}>
          <Heading as="h3" size="lg" mb={2}>
            Explore Bots
          </Heading>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiSearch />
            </InputLeftElement>
            <Input
              placeholder="Search bots..."
              value={searchQuery}
              onChange={handleSearch}
              mb={4}
            />
          </InputGroup>
        </Box>
        
        {featuredBots.length > 0 && (
          <BotList 
            bots={featuredBots} 
            title="Featured Bots" 
            recentChatsMap={recentChatsMap}
          />
        )}
        
        {popularBots.length > 0 && (
          <BotList 
            bots={popularBots} 
            title="Popular Bots" 
            recentChatsMap={recentChatsMap}
          />
        )}
        
        {featuredBots.length === 0 && popularBots.length === 0 && (
          <Box textAlign="center" py={8}>
            <Heading as="h5" size="md" mb={2}>
              No bots match your search
            </Heading>
            <Text color="gray.500">
              Try a different search term or browse all bots
            </Text>
          </Box>
        )}
      </Container>
    </Layout>
  );
}

export default withAuth(Explore);