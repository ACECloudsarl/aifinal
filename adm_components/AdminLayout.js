// components/admin/AdminLayout.js
import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemDecorator, Divider } from '@mui/joy';
import { useRouter } from 'next/router';
import { Settings, Users, Bot, Database, Home, Shield } from 'lucide-react';
import Layout from '../components/layout/Layout';

const AdminLayout = ({ children, title }) => {
  const router = useRouter();
  
  const menuItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Dashboard', 
      path: '/admin' 
    },
    { 
      icon: <Bot size={20} />, 
      label: 'Bots Management', 
      path: '/admin/bots' 
    },
    { 
      icon: <Users size={20} />, 
      label: 'Users', 
      path: '/admin/users' 
    },
    { 
      icon: <Database size={20} />, 
      label: 'Models', 
      path: '/admin/models' 
    },
    { 
      icon: <Settings size={20} />, 
      label: 'Settings', 
      path: '/admin/settings' 
    },
  ];
  
  return (
    <Layout>
      <Box sx={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        {/* Admin Sidebar */}
        <Box
          sx={{
            width: 250,
            borderRight: '1px solid',
            borderColor: 'divider',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography level="title-lg" startDecorator={<Shield size={24} />}>
              Admin Panel
            </Typography>
          </Box>
          
          <Divider />
          
          <List size="sm" sx={{ py: 0 }}>
            {menuItems.map((item) => (
              <ListItem key={item.path}>
                <ListItemButton
                  selected={router.pathname === item.path || 
                           (item.path !== '/admin' && router.pathname.startsWith(item.path))}
                  onClick={() => router.push(item.path)}
                >
                  <ListItemDecorator>{item.icon}</ListItemDecorator>
                  {item.label}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Content Area */}
        <Box sx={{ flex: 1, p: 3 }}>
          <Typography level="h4" sx={{ mb: 3 }}>
            {title}
          </Typography>
          
          {children}
        </Box>
      </Box>
    </Layout>
  );
};

export default AdminLayout;