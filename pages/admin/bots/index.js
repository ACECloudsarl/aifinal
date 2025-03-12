// pages/admin/bots/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Table,
  Typography,
  Sheet,
  Button,
  Input,
  Box,
  Chip,
  IconButton,
  CircularProgress,
  Tooltip,
  Divider,
} from '@mui/joy';
import { Plus, Edit, Trash2, Search, RefreshCcw } from 'lucide-react';
import AdminLayout from '@/adm_components/AdminLayout';
import withAuth from '../../../lib/withAuth';

function AdminBots() {
  const router = useRouter();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchBots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/bots');
      
      if (!response.ok) {
        throw new Error('Failed to fetch bots');
      }
      
      const data = await response.json();
      setBots(data);
    } catch (error) {
      console.error('Error fetching bots:', error);
      setError('Failed to load bots. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBots();
  }, []);
  
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const filteredBots = bots.filter(bot => 
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.model.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEdit = (botId) => {
    router.push(`/admin/bots/${botId}`);
  };
  
  const handleDelete = async (botId) => {
    if (!confirm('Are you sure you want to delete this bot? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/bots/${botId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete bot');
      }
      
      // Remove the deleted bot from the state
      setBots(bots.filter(bot => bot.id !== botId));
    } catch (error) {
      console.error('Error deleting bot:', error);
      alert('Failed to delete bot. Please try again.');
    }
  };
  
  return (
    <AdminLayout title="Bots Management">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Input
            placeholder="Search bots..."
            startDecorator={<Search size={18} />}
            value={searchQuery}
            onChange={handleSearch}
            sx={{ width: 300 }}
          />
          <Button 
            variant="outlined" 
            color="neutral" 
            startDecorator={<RefreshCcw size={18} />}
            onClick={fetchBots}
          >
            Refresh
          </Button>
        </Box>
        
        <Button 
          color="primary" 
          startDecorator={<Plus size={18} />}
          onClick={() => router.push('/admin/bots/new')}
        >
          Add Bot
        </Button>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="danger" sx={{ p: 2 }}>
          {error}
        </Typography>
      ) : (
        <Sheet
          variant="outlined"
          sx={{ 
            borderRadius: 'md', 
            overflow: 'auto',
            maxHeight: 'calc(100vh - 250px)'
          }}
        >
          <Table stickyHeader>
            <thead>
              <tr>
                <th style={{ width: 50 }}>#</th>
                <th style={{ width: 250 }}>Bot</th>
                <th>Description</th>
                <th style={{ width: 150 }}>Category</th>
                <th style={{ width: 250 }}>Model</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBots.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    <Typography level="body-lg">No bots found</Typography>
                  </td>
                </tr>
              ) : (
                filteredBots.map((bot, index) => (
                  <tr key={bot.id}>
                    <td>{index + 1}</td>
                    <td>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={bot.avatar}
                          alt={bot.name}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 'md',
                            objectFit: 'cover',
                          }}
                        />
                        <Typography fontWeight="md">{bot.name}</Typography>
                      </Box>
                    </td>
                    <td>
                      <Typography noWrap sx={{ maxWidth: 400 }}>
                        {bot.description}
                      </Typography>
                    </td>
                    <td>
                      <Chip color="neutral" variant="soft" size="sm">
                        {bot.category}
                      </Chip>
                    </td>
                    <td>
                      <Typography level="body-sm" sx={{ fontFamily: 'monospace' }}>
                        {bot.model}
                      </Typography>
                    </td>
                    <td>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton 
                            variant="plain" 
                            color="neutral" 
                            size="sm"
                            onClick={() => handleEdit(bot.id)}
                          >
                            <Edit size={18} />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete">
                          <IconButton 
                            variant="plain" 
                            color="danger" 
                            size="sm"
                            onClick={() => handleDelete(bot.id)}
                          >
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Sheet>
      )}
    </AdminLayout>
  );
}

export default withAuth(AdminBots);