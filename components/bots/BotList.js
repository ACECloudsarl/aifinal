// components/bots/BotList.js

import React from 'react';
import { Grid, Typography, Box } from '@mui/joy';
import BotCard from './BotCard';

const BotList = ({ bots, title, recentChatsMap = {} }) => {
  return (
    <Box sx={{ mb: 4 }}>
      {title && (
        <Typography level="h5" sx={{ mb: 2 }}>
          {title}
        </Typography>
      )}
      
      <Grid container spacing={2}>
        {bots.map((bot) => (
          <Grid key={bot.id} xs={12} sm={6} md={4} lg={3}>
            <BotCard 
              bot={bot} 
              recentChats={recentChatsMap[bot.id] || []}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BotList;