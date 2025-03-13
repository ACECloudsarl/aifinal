// components/bots/BotList.js
import React from 'react';
import { 
  Box, 
  Heading, 
  SimpleGrid 
} from '@chakra-ui/react';
import BotCard from './BotCard';

const BotList = ({ bots, title, recentChatsMap = {} }) => {
  return (
    <Box mb={4}>
      {title && (
        <Heading 
          as="h5" 
          size="md" 
          mb={2}
        >
          {title}
        </Heading>
      )}
      
      <SimpleGrid 
        columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
        spacing={4}
      >
        {bots.map((bot) => (
          <Box key={bot.id}>
            <BotCard 
              bot={bot} 
              recentChats={recentChatsMap[bot.id] || []}
            />
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default BotList;