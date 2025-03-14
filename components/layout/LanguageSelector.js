// components/common/LanguageSelector.js
import React, { useState, useEffect } from 'react';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Text,
  HStack,
  useColorModeValue,
  Box,
} from '@chakra-ui/react';
import { FiGlobe, FiCheck } from 'react-icons/fi';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇦🇪', dir: 'rtl' },
  { code: 'he', name: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' },
];

const LanguageSelector = ({ onChange }) => {
  const [currentLang, setCurrentLang] = useState('en');
  
  // Background and text colors
  const menuBg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  
  // Set language and direction
  const setLanguage = (langCode) => {
    // Find language in our list
    const lang = languages.find(l => l.code === langCode);
    if (!lang) return;
    
    // Set language
    setCurrentLang(langCode);
    
    // Set document direction
    if (document) {
      document.documentElement.lang = langCode;
      document.documentElement.dir = lang.dir;
      
      // Store in localStorage for persistence
      localStorage.setItem('preferredLanguage', langCode);
      localStorage.setItem('preferredDirection', lang.dir);
    }
    
    // Call onChange if provided
    if (onChange) {
      onChange(langCode, lang.dir);
    }
  };
  
  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      setCurrentLang(savedLang);
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split('-')[0];
      const supportedLang = languages.find(l => l.code === browserLang);
      if (supportedLang) {
        setCurrentLang(browserLang);
      }
    }
  }, []);
  
  // Get current language details
  const currentLanguage = languages.find(l => l.code === currentLang) || languages[0];
  
  return (
    <Menu placement="bottom-end">
      <MenuButton 
        as={Button} 
        variant="ghost" 
        size="sm" 
        rightIcon={<FiGlobe />}
        fontWeight="normal"
        px={2}
      >
        <HStack spacing={2}>
          <Text>{currentLanguage.flag}</Text>
          <Text display={{ base: 'none', md: 'block' }}>{currentLanguage.name}</Text>
        </HStack>
      </MenuButton>
      <MenuList zIndex={100} bg={menuBg} boxShadow="md">
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code} 
            onClick={() => setLanguage(lang.code)}
            _hover={{ bg: hoverBg }}
            bg={lang.code === currentLang ? hoverBg : 'transparent'}
          >
            <HStack spacing={2} width="full" justifyContent="space-between">
              <HStack>
                <Text fontSize="lg" mr={1}>{lang.flag}</Text>
                <Text color={textColor}>{lang.name}</Text>
              </HStack>
              {lang.code === currentLang && <FiCheck />}
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default LanguageSelector;