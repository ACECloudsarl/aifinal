// components/bots/BotList.js
import React from 'react';
import { 
  Box, 
  Heading, 
  SimpleGrid,
  Text,
  Flex,
  Button,
  HStack,
  Badge,
  useColorModeValue,
  Divider,
  Fade
} from '@chakra-ui/react';
import BotCard, { BotCardSkeleton } from './BotCard';
import { FiChevronRight } from 'react-icons/fi';

const BotList = ({ bots, title, subtitle, recentChatsMap = {}, isLoading = false, maxDisplay, showViewMore = false, onViewMore }) => {
  const headingColor = useColorModeValue('gray.800', 'white');
  const subheadingColor = useColorModeValue('gray.600', 'gray.400');
  
  // Handle loading state with skeletons
  if (isLoading) {
    return (
      <Box mb={8}>
        {title && (
          <Box mb={4}>
            <Heading 
              as="h2" 
              size="md" 
              mb={1}
              color={headingColor}
            >
              {title}
            </Heading>
            {subtitle && (
              <Text color={subheadingColor} fontSize="sm">
                {subtitle}
              </Text>
            )}
          </Box>
        )}
        
        <SimpleGrid 
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
          spacing={6}
        >
          {Array(maxDisplay || 8).fill(0).map((_, index) => (
            <BotCardSkeleton key={index} />
          ))}
        </SimpleGrid>
      </Box>
    );
  }
  
  // If no bots to display
  if (!bots || bots.length === 0) {
    return null;
  }
  
  // Limit the number of bots displayed if maxDisplay is provided
  const displayBots = maxDisplay ? bots.slice(0, maxDisplay) : bots;
  
  return (
    <Box mb={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <Box>
          {title && (
            <HStack mb={1}>
              <Heading 
                as="h2" 
                size="md"
                color={headingColor}
              >
                {title}
              </Heading>
              <Badge colorScheme="purple" variant="subtle">
                {bots.length}
              </Badge>
            </HStack>
          )}
          {subtitle && (
            <Text color={subheadingColor} fontSize="sm">
              {subtitle}
            </Text>
          )}
        </Box>
        
        {(showViewMore && bots.length > maxDisplay) && (
          <Button 
            variant="ghost" 
            size="sm" 
            rightIcon={<FiChevronRight />}
            colorScheme="purple"
            onClick={onViewMore}
          >
            View More
          </Button>
        )}
      </Flex>
      
      <SimpleGrid 
        columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
        spacing={6}
      >
        {displayBots.map((bot) => (
          <Fade key={bot.id} in={true} delay={0.1 * (displayBots.indexOf(bot) % 8)}>
            <BotCard 
              bot={bot} 
              recentChats={recentChatsMap[bot.id] || []}
            />
          </Fade>
        ))}
      </SimpleGrid>
      
      {(showViewMore && bots.length > maxDisplay) && (
        <Box mt={6} textAlign="center">
          <Button 
            onClick={onViewMore}
            colorScheme="purple" 
            variant="outline"
            rightIcon={<FiChevronRight />}
          >
            View All {bots.length} Bots
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BotList;