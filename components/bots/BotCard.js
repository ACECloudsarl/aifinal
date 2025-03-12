// components/bots/SimplifiedBotCard.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Button,
  CircularProgress,
} from '@mui/joy';
import { MessageSquare, Star, Plus } from 'lucide-react';

const BotCard = ({ bot }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Function to start a new chat with this bot
  const handleStartNewChat = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    
    try {
      // Create a new chat with this bot
      const response = await fetch('/api/chats/force-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: bot.id,
          title: `Chat with ${bot.name}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      
      const chatData = await response.json();
      
      // Navigate to the newly created chat
      router.push(`/chat/${chatData.id}?chatId=${chatData.id}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create new chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 'lg',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
        }}
      >
        <Avatar
          src={bot.avatar}
          alt={bot.name}
          sx={{
            width: 60,
            height: 60,
            borderRadius: '12px',
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography level="title-md">{bot.name}</Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
            <Chip
              size="sm"
              variant="soft"
              color="neutral"
            >
              {bot.category}
            </Chip>
            <Chip
              size="sm"
              variant="soft"
              color="primary"
              startDecorator={<Star size={14} />}
            >
              {bot.model.includes('70B') ? 'Advanced' : 'Standard'}
            </Chip>
          </Box>
        </Box>
      </Box>
      
      <CardContent sx={{ flex: 1 }}>
        <Typography level="body-sm">
          {bot.description}
        </Typography>
      </CardContent>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Button
          fullWidth
          startDecorator={<Plus size={16} />}
          onClick={handleStartNewChat}
          disabled={loading}
        >
          {loading ? <CircularProgress size="sm" /> : "Start Chat"}
        </Button>
      </Box>
    </Card>
  );
};

export default BotCard;