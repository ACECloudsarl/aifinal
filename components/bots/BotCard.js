// components/bots/BotCard.js
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Image,
  Heading,
  Stack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { FiMessageSquare, FiExternalLink, FiStar } from 'react-icons/fi';

export const BotCardSkeleton = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Card
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      shadow="sm"
      h="full"
      transition="all 0.3s"
      _hover={{ shadow: 'md', transform: 'translateY(-4px)' }}
    >
      <CardHeader pb={0}>
        <Flex justify="space-between" align="flex-start">
          <Skeleton height="48px" width="48px" borderRadius="md" />
          <Skeleton height="24px" width="48px" borderRadius="md" />
        </Flex>
        <SkeletonText mt={4} noOfLines={1} skeletonHeight={6} width="80%" />
      </CardHeader>
      
      <CardBody>
        <SkeletonText mt={2} noOfLines={3} spacing={2} />
        <Flex mt={4} flexWrap="wrap" gap={1}>
          <Skeleton height="20px" width="60px" borderRadius="full" />
          <Skeleton height="20px" width="80px" borderRadius="full" />
        </Flex>
      </CardBody>
      
      <CardFooter borderTopWidth="1px" borderColor={borderColor} p={3}>
        <Flex width="100%" gap={2}>
          <Skeleton height="36px" flex="1" borderRadius="md" />
          <Skeleton height="36px" flex="1" borderRadius="md" />
        </Flex>
      </CardFooter>
    </Card>
  );
};

const BotCard = ({ bot, onStartChat, onView, isLoading = false }) => {
  if (isLoading) {
    return <BotCardSkeleton />;
  }
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tagBg = useColorModeValue('gray.100', 'gray.700');
  const tagColor = useColorModeValue('gray.700', 'gray.300');
  
  // Get color scheme based on bot category
  const getCategoryColorScheme = (category) => {
    const categoryColors = {
      'creative': 'purple',
      'coding': 'blue',
      'productivity': 'green',
      'fun': 'pink',
      'math': 'orange',
      'education': 'teal'
    };
    
    return categoryColors[category?.toLowerCase()] || 'brand';
  };
  
  const colorScheme = getCategoryColorScheme(bot.category);
  
  // Get bot icon or use fallback
  const botIcon = bot.icon || "🤖";
  
  return (
    <Card
      borderRadius="lg"
      overflow="hidden"
      borderWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
      shadow="sm"
      h="full"
      transition="all 0.3s"
      _hover={{ 
        shadow: 'md', 
        transform: 'translateY(-4px)',
        borderColor: `${colorScheme}.300`,
      }}
      display="flex"
      flexDirection="column"
    >
      <CardHeader pb={1}>
        <Flex justify="space-between" align="flex-start">
          <Flex
            align="center"
            justify="center"
            bg={useColorModeValue(`${colorScheme}.100`, `${colorScheme}.900`)}
            color={useColorModeValue(`${colorScheme}.700`, `${colorScheme}.300`)}
            boxSize="48px"
            borderRadius="md"
            fontSize="2xl"
          >
            {botIcon}
          </Flex>
          
          <Badge
            display="flex"
            alignItems="center"
            colorScheme="yellow"
            px={2}
            py={1}
            borderRadius="md"
          >
            <Box as={FiStar} mr={1} /> {bot.rating || "4.8"}
          </Badge>
        </Flex>
        
        <Heading size="md" mt={3} fontWeight="semibold">
          {bot.name}
        </Heading>
      </CardHeader>
      
      <CardBody pt={0} flex="1">
        <Text
          color={useColorModeValue('gray.600', 'gray.400')}
          fontSize="sm"
          noOfLines={3}
          height="4.5em"
          overflow="hidden"
        >
          {bot.description}
        </Text>
        
        <Stack direction="row" mt={4} flexWrap="wrap" spacing={0} gap={1}>
          {bot.tags ? (
            bot.tags.map((tag, index) => (
              <Badge
                key={index}
                bg={tagBg}
                color={tagColor}
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="xs"
              >
                {tag}
              </Badge>
            ))
          ) : (
            <Badge
              bg={useColorModeValue(`${colorScheme}.100`, `${colorScheme}.900`)}
              color={useColorModeValue(`${colorScheme}.700`, `${colorScheme}.300`)}
              px={2}
              py={0.5}
              borderRadius="full"
              fontSize="xs"
            >
              {bot.category}
            </Badge>
          )}
        </Stack>
      </CardBody>
      
      <CardFooter
        borderTopWidth="1px"
        borderColor={borderColor}
        p={3}
        bg={useColorModeValue('gray.50', 'gray.900')}
      >
        <HStack width="100%" spacing={2}>
          <Button
            leftIcon={<FiExternalLink />}
            variant="outline"
            size="sm"
            flex="1"
            onClick={onView}
          >
            Details
          </Button>
          
          <Button
            leftIcon={<FiMessageSquare />}
            colorScheme={colorScheme}
            size="sm"
            flex="1"
            onClick={onStartChat}
          >
            Chat
          </Button>
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default BotCard;