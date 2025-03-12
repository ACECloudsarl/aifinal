// pages/admin/index.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  Typography,
  AspectRatio,
  Divider,
  Sheet,
  List,
  ListItem,
  ListItemDecorator,
  ListItemContent,
  CircularProgress,
} from '@mui/joy';
import { Users, Bot, MessageSquare, Cpu } from 'lucide-react';
import AdminLayout from '../../adm_components/AdminLayout';
import withAuth from '../../lib/withAuth';

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
  
  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout title="Dashboard">
      {/* Stats Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card variant="soft" sx={{ bgcolor: 'primary.softBg' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AspectRatio
                ratio="1/1"
                sx={{
                  width: 50,
                  bgcolor: 'primary.softActiveColor',
                  borderRadius: 'md',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={30} />
                </Box>
              </AspectRatio>
              <Box>
                <Typography level="h4">{stats.totalUsers}</Typography>
                <Typography level="body-sm">Total Users</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card variant="soft" sx={{ bgcolor: 'success.softBg' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AspectRatio
                ratio="1/1"
                sx={{
                  width: 50,
                  bgcolor: 'success.softActiveColor',
                  borderRadius: 'md',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={30} />
                </Box>
              </AspectRatio>
              <Box>
                <Typography level="h4">{stats.totalBots}</Typography>
                <Typography level="body-sm">Active Bots</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card variant="soft" sx={{ bgcolor: 'neutral.softBg' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AspectRatio
                ratio="1/1"
                sx={{
                  width: 50,
                  bgcolor: 'neutral.softActiveColor',
                  borderRadius: 'md',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={30} />
                </Box>
              </AspectRatio>
              <Box>
                <Typography level="h4">{stats.totalChats}</Typography>
                <Typography level="body-sm">Total Chats</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        
        <Grid xs={12} sm={6} md={3}>
          <Card variant="soft" sx={{ bgcolor: 'warning.softBg' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AspectRatio
                ratio="1/1"
                sx={{
                  width: 50,
                  bgcolor: 'warning.softActiveColor',
                  borderRadius: 'md',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Cpu size={30} />
                </Box>
              </AspectRatio>
              <Box>
                <Typography level="h4">{stats.activeUsers}</Typography>
                <Typography level="body-sm">Active Today</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Recently Added Bots */}
        <Grid xs={12} md={6}>
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: 'md',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, bgcolor: 'background.level1' }}>
              <Typography level="title-md">Recently Added Bots</Typography>
            </Box>
            
            <Divider />
            
            <List sx={{ overflow: 'auto', maxHeight: 350 }}>
              {recentBots.length === 0 ? (
                <ListItem>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    No bots found
                  </Typography>
                </ListItem>
              ) : (
                recentBots.map((bot) => (
                  <ListItem key={bot.id}>
                    <ListItemDecorator>
                      <AspectRatio
                        ratio="1/1"
                        sx={{
                          width: 36,
                          borderRadius: 'sm',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={bot.avatar}
                          alt={bot.name}
                          style={{ objectFit: 'cover' }}
                        />
                      </AspectRatio>
                    </ListItemDecorator>
                    <ListItemContent>
                      <Typography>{bot.name}</Typography>
                      <Typography level="body-xs" noWrap>
                        {bot.description}
                      </Typography>
                    </ListItemContent>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      {new Date(bot.createdAt).toLocaleDateString()}
                    </Typography>
                  </ListItem>
                ))
              )}
            </List>
          </Sheet>
        </Grid>
        
        {/* Top Used Bots */}
        <Grid xs={12} md={6}>
          <Sheet
            variant="outlined"
            sx={{
              borderRadius: 'md',
              height: '100%',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2, bgcolor: 'background.level1' }}>
              <Typography level="title-md">Top Used Bots</Typography>
            </Box>
            
            <Divider />
            
            <List sx={{ overflow: 'auto', maxHeight: 350 }}>
              {topBots.length === 0 ? (
                <ListItem>
                  <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                    No usage data available
                  </Typography>
                </ListItem>
              ) : (
                topBots.map((bot, index) => (
                  <ListItem key={bot.id}>
                    <ListItemDecorator>
                      <AspectRatio
                        ratio="1/1"
                        sx={{
                          width: 36,
                          borderRadius: 'sm',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={bot.avatar}
                          alt={bot.name}
                          style={{ objectFit: 'cover' }}
                        />
                      </AspectRatio>
                    </ListItemDecorator>
                    <ListItemContent>
                      <Typography>{bot.name}</Typography>
                      <Typography level="body-xs" noWrap>
                        {bot.chatCount} chats · {bot.messageCount} messages
                      </Typography>
                    </ListItemContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'primary.softBg',
                        color: 'primary.solidBg',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    >
                      {index + 1}
                    </Box>
                  </ListItem>
                ))
              )}
            </List>
          </Sheet>
        </Grid>
      </Grid>
    </AdminLayout>
  );
}

export default withAuth(AdminDashboard);