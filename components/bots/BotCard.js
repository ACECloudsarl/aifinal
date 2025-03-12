// Let's completely fix the BotCard component to force new chat creation
// components/bots/BotCard.js

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
  IconButton,
  CircularProgress,
  Menu,
  MenuItem,
  Divider,

} from '@mui/joy';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { MessageSquare, Star, Clock, Plus, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const BotCard = ({ bot, recentChats = [] }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleChatMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  // Function to start a completely new chat with this bot
  const handleStartNewChat = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    
    try {
      // Force create a new chat with this bot
      const response = await fetch('/api/chats/force-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId: bot.id,
          title: 'New Chat with ' + bot.name,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat');
      }
      
      const chatData = await response.json();
      
      // Navigate to the newly created chat with timestamp to avoid caching
      const timestamp = new Date().getTime();
      router.push(`/chat/${chatData.id}?new=${timestamp}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create new chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Open a specific existing chat
  const handleOpenChat = (chatId) => {
    router.push(`/chat/${chatId}`);
    handleClose();
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
              4.8
            </Chip>
          </Box>
        </Box>
      </Box>
      
      <CardContent sx={{ flex: 1 }}>
        <Typography level="body-sm">
          {bot.description}
        </Typography>
      </CardContent>
      
      <Box sx={{ p: 2, mt: 'auto', display: 'flex' }}>
        <Button
          fullWidth
          startDecorator={<Plus size={16} />}
          onClick={handleStartNewChat}
          disabled={loading}
          sx={{ mr: 1 }}
        >
          {loading ? <CircularProgress size="sm" /> : "New Chat"}
        </Button>
        
        {recentChats.length > 0 && (
          <IconButton 
            variant="outlined" 
            color="neutral"
            onClick={handleChatMenuClick}
          >
            <History size={18} />
          </IconButton>
        )}
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          placement="bottom-end"
        >
          <Typography level="body-sm" sx={{ px: 2, py: 1 }}>
            Recent Chats
          </Typography>
          <Divider />
          
          {recentChats.map((chat) => (
            <MenuItem key={chat.id} onClick={() => handleOpenChat(chat.id)}>
              <ListItemIcon>
                <MessageSquare size={18} />
              </ListItemIcon>
              <ListItemText>
                {chat.title}
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                </Typography>
              </ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Card>
  );
};

export default BotCard;