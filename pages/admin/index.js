// pages/admin/index.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  CardHeader,
  Text,
  Flex,
  List,
  ListItem,
  Divider,
  Avatar,
  HStack,
  VStack,
  Spinner,
  useColorModeValue,
  Icon,
  SimpleGrid,
  Badge,
  Progress,
  Heading,
  Button
} from '@chakra-ui/react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon,
  InfoIcon,
  TimeIcon
} from '@chakra-ui/icons';
import { 
  Users, 
  Bot, 
  MessageSquare, 
  Cpu,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';
import AdminLayout from '@/adm_components/AdminLayout';
import withAuth from '../../lib/withAuth';
import { formatDistanceToNow } from 'date-fns';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBots: 0,
    totalChats: 0,
    activeUsers: 0,
  });
  
  const [recentBots, setRecentBots] = useState([]);
  const [topBots, setTopBots] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBg1 = useColorModeValue('purple.50', 'purple.900');
  const iconBg2 = useColorModeValue('green.50', 'green.900');
  const iconBg3 = useColorModeValue('blue.50', 'blue.900');
  const iconBg4 = useColorModeValue('orange.50', 'orange.900');
  const iconColor1 = useColorModeValue('purple.500', 'purple.200');
  const iconColor2 = useColorModeValue('green.500', 'green.200');
  const iconColor3 = useColorModeValue('blue.500', 'blue.200');
  const iconColor4 = useColorModeValue('orange.500', 'orange.200');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
          setRecentBots(data.recentBots || []);
          setTopBots(data.topBots || []);
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);
  
  // Function to format large numbers
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num;
  };
  
  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <Flex justify="center" align="center" minH="400px">
          <VStack spacing={4}>
            <Spinner size="xl" thickness="4px" color="purple.500" />
            <Text>Loading dashboard data...</Text>
          </VStack>
        </Flex>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Dashboard">
      {/* Stats Cards */}
      <SimpleGrid 
        columns={{ base: 1, md: 2, lg: 4 }} 
        spacing={5} 
        mb={8}
      >
        {/* Total Users Card */}
        <Card boxShadow="sm" bg={cardBg}>
          <CardBody>
            <Flex align="center">
              <Box
                p={3}
                borderRadius="lg"
                bg={iconBg1}
                mr={4}
              >
                <Icon as={Users} boxSize={6} color={iconColor1} />
              </Box>
              <Box>
                <StatLabel fontWeight="medium">Total Users</StatLabel>
                <StatNumber fontSize="3xl">{formatNumber(stats.totalUsers)}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={ArrowUpIcon} color="green.500" />
                    <Text>12% more than last month</Text>
                  </HStack>
                </StatHelpText>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        {/* Active Bots Card */}
        <Card boxShadow="sm" bg={cardBg}>
          <CardBody>
            <Flex align="center">
              <Box
                p={3}
                borderRadius="lg"
                bg={iconBg2}
                mr={4}
              >
                <Icon as={Bot} boxSize={6} color={iconColor2} />
              </Box>
              <Box>
                <StatLabel fontWeight="medium">Active Bots</StatLabel>
                <StatNumber fontSize="3xl">{formatNumber(stats.totalBots)}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={ArrowUpIcon} color="green.500" />
                    <Text>3 new this week</Text>
                  </HStack>
                </StatHelpText>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        {/* Total Chats Card */}
        <Card boxShadow="sm" bg={cardBg}>
          <CardBody>
            <Flex align="center">
              <Box
                p={3}
                borderRadius="lg"
                bg={iconBg3}
                mr={4}
              >
                <Icon as={MessageSquare} boxSize={6} color={iconColor3} />
              </Box>
              <Box>
                <StatLabel fontWeight="medium">Total Chats</StatLabel>
                <StatNumber fontSize="3xl">{formatNumber(stats.totalChats)}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={TrendingUp} boxSize={3} color="green.500" />
                    <Text>+18% this month</Text>
                  </HStack>
                </StatHelpText>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        {/* Active Today Card */}
        <Card boxShadow="sm" bg={cardBg}>
          <CardBody>
            <Flex align="center">
              <Box
                p={3}
                borderRadius="lg"
                bg={iconBg4}
                mr={4}
              >
                <Icon as={Cpu} boxSize={6} color={iconColor4} />
              </Box>
              <Box>
                <StatLabel fontWeight="medium">Active Today</StatLabel>
                <StatNumber fontSize="3xl">{formatNumber(stats.activeUsers)}</StatNumber>
                <StatHelpText>
                  <HStack>
                    <Icon as={Calendar} boxSize={3} color="blue.500" />
                    <Text>Daily active users</Text>
                  </HStack>
                </StatHelpText>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Recent and Top Bots Sections */}
      <Grid 
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={6}
      >
        {/* Recently Added Bots */}
        <GridItem>
          <Card variant="outline" height="100%">
            <CardHeader pb={2}>
              <Heading size="md">Recently Added Bots</Heading>
            </CardHeader>
            <Divider borderColor={borderColor} />
            <CardBody maxH="350px" overflowY="auto" pt={3} pb={1}>
              {recentBots.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={6}>
                  No bots added recently
                </Text>
              ) : (
                <List spacing={3}>
                  {recentBots.map((bot) => (
                    <ListItem key={bot.id}>
                      <HStack spacing={4}>
                        <Avatar
                          src={bot.avatar}
                          name={bot.name}
                          size="md"
                          borderRadius="md"
                        />
                        <VStack align="start" spacing={0} flex="1">
                          <Text fontWeight="medium">{bot.name}</Text>
                          <Text fontSize="sm" color="gray.500" noOfLines={2}>
                            {bot.description}
                          </Text>
                        </VStack>
                        <Flex direction="column" align="flex-end">
                          <Badge colorScheme="purple" mb={1}>
                            {bot.category}
                          </Badge>
                          <HStack fontSize="xs" color="gray.500">
                            <TimeIcon />
                            <Text>
                              {formatDistanceToNow(new Date(bot.createdAt), { addSuffix: true })}
                            </Text>
                          </HStack>
                        </Flex>
                      </HStack>
                      <Divider mt={3} borderColor={borderColor} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardBody>
          </Card>
        </GridItem>
        
        {/* Top Used Bots */}
        <GridItem>
          <Card variant="outline" height="100%">
            <CardHeader pb={2}>
              <Heading size="md">Top Used Bots</Heading>
            </CardHeader>
            <Divider borderColor={borderColor} />
            <CardBody maxH="350px" overflowY="auto" pt={3} pb={1}>
              {topBots.length === 0 ? (
                <Text color="gray.500" textAlign="center" py={6}>
                  No usage data available
                </Text>
              ) : (
                <List spacing={3}>
                  {topBots.map((bot, index) => (
                    <ListItem key={bot.id}>
                      <HStack spacing={4}>
                        <Flex
                          w="28px" 
                          h="28px" 
                          borderRadius="full" 
                          bg={index < 3 ? 'purple.500' : 'gray.200'} 
                          color={index < 3 ? 'white' : 'gray.600'}
                          align="center"
                          justify="center"
                          fontWeight="bold"
                        >
                          {index + 1}
                        </Flex>
                        <Avatar
                          src={bot.avatar}
                          name={bot.name}
                          size="md"
                          borderRadius="md"
                        />
                        <VStack align="start" spacing={0} flex="1">
                          <Text fontWeight="medium">{bot.name}</Text>
                          <HStack fontSize="sm" color="gray.600">
                            <Text>{bot.chatCount} chats</Text>
                            <Text>•</Text>
                            <Text>{bot.messageCount} messages</Text>
                          </HStack>
                        </VStack>
                        <VStack align="flex-end" spacing={1}>
                          <Badge colorScheme={index < 3 ? 'green' : 'gray'}>
                            {index < 3 ? 'Popular' : 'Active'}
                          </Badge>
                          <Progress 
                            value={index === 0 ? 100 : (100 - (index * 15))} 
                            size="xs" 
                            colorScheme="purple" 
                            width="60px"
                            borderRadius="full"
                          />
                        </VStack>
                      </HStack>
                      <Divider mt={3} borderColor={borderColor} />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      {/* System Status Card */}
      <Card variant="outline" mt={6}>
        <CardHeader pb={2}>
          <HStack>
            <Heading size="md">System Status</Heading>
            <Badge colorScheme="green">Healthy</Badge>
          </HStack>
        </CardHeader>
        <Divider borderColor={borderColor} />
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5}>
            <Stat>
              <StatLabel>API Latency</StatLabel>
              <StatNumber>32ms</StatNumber>
              <StatHelpText>
                <HStack>
                  <Icon as={ArrowDownIcon} color="green.500" />
                  <Text>12% improvement</Text>
                </HStack>
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>API Usage</StatLabel>
              <StatNumber>76%</StatNumber>
              <Progress 
                value={76} 
                size="xs" 
                colorScheme="purple" 
                mt={2} 
                mb={1} 
                borderRadius="full"
              />
              <StatHelpText>
                Of monthly quota
              </StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Error Rate</StatLabel>
              <StatNumber>0.12%</StatNumber>
              <StatHelpText>
                <HStack>
                  <Icon as={InfoIcon} color="blue.500" />
                  <Text>Within normal range</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </CardBody>
      </Card>
    </AdminLayout>
  );
}

export default withAuth(AdminDashboard);