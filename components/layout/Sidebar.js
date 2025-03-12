// components/layout/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import {
  Sheet,
  List,
  ListItem,
  ListItemButton,
  ListItemDecorator,
  ListItemContent,
  Typography,
  Divider,
  Box,
  Avatar,
  Button,
  IconButton,
} from '@mui/joy';
import {
  Home,
  Settings,
  Users,
  MessageSquare,
  Crown,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const Sidebar = ({ open, setOpen, user }) => {
  const { t } = useTranslation();
  const router = useRouter();

  // Check text direction to handle RTL vs. LTR
  const [isRTL, setIsRTL] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsRTL(document.dir === 'rtl');
    }
  }, []);

  const menuItems = [
    { icon: <Home size={20} />, label: t('sidebar.explore'), path: '/explore' },
    { icon: <MessageSquare size={20} />, label: t('sidebar.chat'), path: '/chat' },
    { icon: <Settings size={20} />, label: t('sidebar.settings'), path: '/settings' },
  ];

  return (
    <Sheet
      sx={{
        // Stick the sidebar to the viewport on desktop, but act as a drawer on mobile
        position: { xs: 'fixed', md: 'sticky' },
        top: 0,
        left: isRTL ? 'auto' : 0,
        right: isRTL ? 0 : 'auto',
        height: '100vh',
        // For mobile: slide from the left (or right if RTL)
        transform: {
          xs: open
            ? 'translateX(0)'
            : isRTL
            ? 'translateX(100%)'
            : 'translateX(-100%)',
          md: 'none', // No transform on desktop
        },
        // On mobile: full width when open, 0 when closed
        // On desktop: toggles between a mini variant (72px) and full (280px)
        width: {
          xs: open ? 240 : 0,
          md: open ? 280 : 72,
        },
        transition: 'width 0.3s, transform 0.3s',
        zIndex: 1200,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--joy-palette-background-surface)',
        boxShadow: 'var(--joy-shadow-md)',
        overflowY: 'auto',
        p: 2,
      }}
    >
      {/* HEADER SECTION */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          mb: 2,
        }}
      >
        {/* App Title or Logo (hide text if collapsed) */}
        {open && (
          <Typography level="h4" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {t('app.title')}
          </Typography>
        )}

        {/* Desktop toggle button */}
        <IconButton
          variant="plain"
          color="neutral"
          size="sm"
          onClick={() => setOpen(!open)}
          sx={{ display: { xs: 'none', md: 'inline-flex' } }}
        >
          {/* If LTR and sidebar is open, show <ChevronLeft />. Otherwise show <ChevronRight /> */}
          {/* If RTL, we flip the icons */}
          {isRTL ? (
            open ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
          ) : open ? (
            <ChevronLeft size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </IconButton>

        {/* Mobile close button (only visible on small screens) */}
        <IconButton
          variant="plain"
          color="neutral"
          size="sm"
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          onClick={() => setOpen(false)}
        >
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </IconButton>
      </Box>

      {/* MENU LIST */}
      <List size="sm" sx={{ flex: 1 }}>
        {menuItems.map((item) => {
          const selected = router.pathname === item.path;
          return (
            <ListItem key={item.path}>
              <ListItemButton
                selected={selected}
                onClick={() => {
                  router.push(item.path);
                  // Auto-close on mobile
                  if (window.innerWidth < 768) setOpen(false);
                }}
                sx={{
                  borderRadius: 'md',
                  mb: 0.5,
                  // Keep icon aligned if collapsed
                  justifyContent: open ? 'initial' : 'center',
                }}
              >
                <ListItemDecorator>{item.icon}</ListItemDecorator>
                {/* Only show label text when open */}
                {open && <ListItemContent>{item.label}</ListItemContent>}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider sx={{ my: 2 }} />

      {/* UPGRADE BUTTON */}
      {open && (
        <Box sx={{ mb: 2 }}>
          <Button
            variant="soft"
            color="warning"
            startDecorator={<Crown size={16} />}
            onClick={() => router.push('/upgrade')}
            fullWidth
          >
            {t('sidebar.upgrade')}
          </Button>
        </Box>
      )}

      {/* USER INFO */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: open ? 2 : 0,
          borderRadius: 'md',
          backgroundColor: open ? 'var(--joy-palette-background-level1)' : 'transparent',
          justifyContent: 'center',
        }}
      >
        <Avatar
          src={user?.avatar || '/images/default-avatar.png'}
          alt={user?.name || 'User'}
        />

        {/* Only show user details & logout if open */}
        {open && (
          <>
            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography level="body-sm" fontWeight="bold">
                {user?.name || 'User'}
              </Typography>
              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
            <IconButton variant="plain" color="neutral" size="sm">
              <LogOut size={18} />
            </IconButton>
          </>
        )}
      </Box>
    </Sheet>
  );
};

export default Sidebar;
