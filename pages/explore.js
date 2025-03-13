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
  AlertDescription,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Tag,
  TagLabel,
  HStack,
  useColorModeValue,
  Flex,
  Badge,
  Skeleton,
  Button,
  Collapse,
  Divider,
  IconButton
} from '@chakra-ui/react';
import { 
  FiSearch, 
  FiTrendingUp, 
  FiStar, 
  FiClock, 
  FiFilter, 
  FiChevronDown, 
  FiChevronUp,
  FiX,
  FiRefreshCw
} from 'react-icons/fi';
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  
  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'creative', name: 'Creative Writing' },
    { id: 'coding', name: 'Programming' },
    { id: 'education', name: 'Education' },
    { id: 'business', name: 'Business' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'productivity', name: 'Productivity' },
    { id: 'health', name: 'Health & Wellness' },
  ];
  
  // Colors
  const bgCard = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const activeTabBg = useColorModeValue('purple.50', 'purple.900');
  const activeTabColor = useColorModeValue('purple.600', 'purple.200');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
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
        const filtered = filterBots(botsData, searchQuery, selectedCategory);
        
        // Sort based on tab index
        switch (tabIndex) {
          case 0: // Featured
            setFeaturedBots(filtered.slice(0, 4));
            setPopularBots(filtered.slice(4));
            break;
          case 1: // Popular
            setFeaturedBots([]);
            setPopularBots(filtered.sort((a, b) => b.popularity - a.popularity));
            break;
          case 2: // Recently Used
            const recentlyUsed = filtered.filter(bot => 
              recentChatsData[bot.id] && recentChatsData[bot.id].length > 0
            ).sort((a, b) => {
              const aLastChat = recentChatsData[a.id]?.[0]?.updatedAt || 0;
              const bLastChat = recentChatsData[b.id]?.[0]?.updatedAt || 0;
              return new Date(bLastChat) - new Date(aLastChat);
            });
            setFeaturedBots([]);
            setPopularBots(recentlyUsed);
            break;
          default:
            setFeaturedBots(filtered.slice(0, 4));
            setPopularBots(filtered.slice(4));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load bots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchQuery, selectedCategory, tabIndex]);
  
  // Filter bots based on search and category
  const filterBots = (bots, query, category) => {
    return bots.filter(bot => {
      const matchesSearch = !query || 
        bot.name.toLowerCase().includes(query.toLowerCase()) ||
        bot.description.toLowerCase().includes(query.toLowerCase());
        
      const matchesCategory = category === 'all' || 
        bot.category.toLowerCase() === category.toLowerCase();
        
      return matchesSearch && matchesCategory;
    });
  };
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };
  
  const handleTabChange = (index) => {
    setTabIndex(index);
  };
  
  // Loading skeletons
  const LoadingSkeletons = () => (
    <Box my={6}>
      <HStack mb={6}>
        <Skeleton height="30px" width="120px" />
        <Skeleton height="30px" width="80px" />
      </HStack>
      
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
        {Array(8).fill(0).map((_, i) => (
          <Skeleton key={i} height="300px" borderRadius="lg" />
        ))}
      </SimpleGrid>
    </Box>
  );
  
  return (
    <Layout currentView="explore">
      <Container maxW="container.xl" py={4}>
        {error && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertTitle mr={2}>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Box mb={6}>
          <Heading as="h1" size="lg" mb={4}>
            Explore Bots
          </Heading>
          
          <HStack mb={4}>
            <InputGroup size="lg">
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search bots by name, description or category..."
                value={searchQuery}
                onChange={handleSearch}
                borderRadius="lg"
                bg={bgCard}
                _focus={{
                  boxShadow: '0 0 0 2px var(--chakra-colors-purple-500)',
                  borderColor: 'purple.500'
                }}
              />
              {searchQuery && (
                <InputLeftElement right="8px" left="auto" onClick={clearSearch} cursor="pointer">
                  <FiX />
                </InputLeftElement>
              )}
            </InputGroup>
            
            <Button
              leftIcon={<FiFilter />}
              rightIcon={showFilters ? <FiChevronUp /> : <FiChevronDown />}
              onClick={() => setShowFilters(!showFilters)}
              colorScheme="purple"
              variant="outline"
              size="lg"
            >
              Filters
            </Button>
          </HStack>
          
          <Collapse in={showFilters} animateOpacity>
            <Box 
              p={4} 
              bg={bgCard} 
              borderRadius="md" 
              borderWidth="1px" 
              borderColor={borderColor}
              mb={4}
            >
              <Text fontWeight="medium" mb={3}>Categories</Text>
              <Flex wrap="wrap" gap={2}>
                {categories.map(category => (
                  <Tag
                    key={category.id}
                    size="lg"
                    borderRadius="full"
                    variant={selectedCategory === category.id ? "solid" : "subtle"}
                    colorScheme={selectedCategory === category.id ? "purple" : "gray"}
                    cursor="pointer"
                    onClick={() => handleCategorySelect(category.id)}
                    _hover={{
                      opacity: 0.8
                    }}
                  >
                    <TagLabel>{category.name}</TagLabel>
                  </Tag>
                ))}
              </Flex>
            </Box>
          </Collapse>
          
          <Tabs 
            colorScheme="purple" 
            variant="soft-rounded" 
            onChange={handleTabChange}
            mb={4}
          >
            <TabList>
              <Tab 
                _selected={{ bg: activeTabBg, color: activeTabColor }}
                leftIcon={<FiStar />}
              >
                Featured
              </Tab>
              <Tab 
                _selected={{ bg: activeTabBg, color: activeTabColor }}
                leftIcon={<FiTrendingUp />}
              >
                Popular
              </Tab>
              <Tab 
                _selected={{ bg: activeTabBg, color: activeTabColor }}
                leftIcon={<FiClock />}
              >
                Recently Used
              </Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel p={0} pt={4}>
                {/* Featured and Popular sections */}
                {isLoading ? (
                  <LoadingSkeletons />
                ) : (
                  <>
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
                        title={featuredBots.length > 0 ? "More Bots to Explore" : "All Bots"} 
                        recentChatsMap={recentChatsMap}
                      />
                    )}
                    
                    {featuredBots.length === 0 && popularBots.length === 0 && (
                      <Box textAlign="center" py={12} bg={bgCard} borderRadius="lg" shadow="sm">
                        <Heading as="h5" size="md" mb={2}>
                          No bots match your search
                        </Heading>
                        <Text color="gray.500" mb={4}>
                          Try a different search term or category filter
                        </Text>
                        <Button 
                          leftIcon={<FiRefreshCw />} 
                          onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                          }}
                          colorScheme="purple"
                          variant="outline"
                        >
                          Reset Filters
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </TabPanel>
              
              <TabPanel p={0} pt={4}>
                {/* Popular bots */}
                {isLoading ? (
                  <LoadingSkeletons />
                ) : (
                  <>
                    {popularBots.length > 0 ? (
                      <BotList 
                        bots={popularBots} 
                        title="Popular Bots" 
                        recentChatsMap={recentChatsMap}
                      />
                    ) : (
                      <Box textAlign="center" py={12} bg={bgCard} borderRadius="lg" shadow="sm">
                        <Heading as="h5" size="md" mb={2}>
                          No popular bots found
                        </Heading>
                        <Text color="gray.500">
                          Try a different search term or category filter
                        </Text>
                      </Box>
                    )}
                  </>
                )}
              </TabPanel>
              
              <TabPanel p={0} pt={4}>
                {/* Recently used bots */}
                {isLoading ? (
                  <LoadingSkeletons />
                ) : (
                  <>
                    {popularBots.length > 0 ? (
                      <BotList 
                        bots={popularBots} 
                        title="Recently Used Bots" 
                        recentChatsMap={recentChatsMap}
                      />
                    ) : (
                      <Box textAlign="center" py={12} bg={bgCard} borderRadius="lg" shadow="sm">
                        <Heading as="h5" size="md" mb={2}>
                          No recently used bots
                        </Heading>
                        <Text color="gray.500" mb={4}>
                          Start a conversation with a bot to see it here
                        </Text>
                        <Button 
                          leftIcon={<FiStar />} 
                          onClick={() => setTabIndex(0)}
                          colorScheme="purple"
                        >
                          Explore Featured Bots
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </Layout>
  );
}

export default withAuth(Explore);