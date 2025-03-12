// components/layout/Header.js
import React, { useState,useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  IconButton,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
  useColorScheme,
} from '@mui/joy';
import {
  Menu as MenuIcon,
  Moon,
  Sun,
  Globe,
  PaletteIcon,
} from 'lucide-react';

const Header = ({ setOpen }) => {
  const { t, i18n } = useTranslation();
  const { mode, setMode } = useColorScheme();
 const [isRTL, setIsRTL] = useState(false);

   useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      setIsRTL(document.dir === 'rtl');
    }
  }, []);


  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 99,
        backdropFilter: 'blur(6px)',
        backgroundColor: 'var(--joy-palette-background-surface)',
        boxShadow: 'sm',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <IconButton
        variant="plain"
        color="neutral"
        size="md"
        sx={{ display: { xs: 'flex', md: 'none' } }}
        onClick={() => setOpen(true)}
      >
        <MenuIcon />
      </IconButton>

      <Box sx={{ flex: 1 }} />

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Dropdown>
          <Tooltip title={t('header.theme')}>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'md' } }}
            >
              <PaletteIcon size={20} />
            </MenuButton>
          </Tooltip>
          <Menu placement="bottom-end">
            <MenuItem onClick={() => document.dispatchEvent(new CustomEvent('themeChange', { detail: 'purple' }))}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#bc71dd', mr: 1 }} />
              Purple
            </MenuItem>
            <MenuItem onClick={() => document.dispatchEvent(new CustomEvent('themeChange', { detail: 'teal' }))}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#3dd2c0', mr: 1 }} />
              Teal
            </MenuItem>
            <MenuItem onClick={() => document.dispatchEvent(new CustomEvent('themeChange', { detail: 'amber' }))}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ffb74d', mr: 1 }} />
              Amber
            </MenuItem>
            <MenuItem onClick={() => document.dispatchEvent(new CustomEvent('themeChange', { detail: 'rose' }))}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#ff6b95', mr: 1 }} />
              Rose
            </MenuItem>
            <MenuItem onClick={() => document.dispatchEvent(new CustomEvent('themeChange', { detail: 'blue' }))}>
              <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#5b9aff', mr: 1 }} />
              Blue
            </MenuItem>
          </Menu>
        </Dropdown>

        <Tooltip title={t('header.appearance')}>
          <IconButton
            variant="plain"
            color="neutral"
            size="md"
            onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          >
            {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </IconButton>
        </Tooltip>

        <Dropdown>
          <Tooltip title={t('header.language')}>
            <MenuButton
              slots={{ root: IconButton }}
              slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'md' } }}
            >
              <Globe size={20} />
            </MenuButton>
          </Tooltip>
          <Menu placement="bottom-end">
            <MenuItem onClick={() => handleLanguageChange('en')}>English</MenuItem>
            <MenuItem onClick={() => handleLanguageChange('ar')}>العربية</MenuItem>
            <MenuItem onClick={() => handleLanguageChange('fr')}>Français</MenuItem>
          </Menu>
        </Dropdown>
      </Box>
    </Box>
  );
};

export default Header;