// pages/settings.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Typography,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Card,
  CardContent,
} from '@mui/joy';
import { UserCircle, Volume2, Palette, Bell, Globe } from 'lucide-react';
import Layout from '../components/layout/Layout';
import VoiceSettings from '../components/settings/VoiceSettings';
import withAuth from '../lib/withAuth';

function Settings() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography level="h3" sx={{ mb: 4 }}>
          {t('settings.title', 'Settings')}
        </Typography>

        <Tabs 
          aria-label="Settings tabs" 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)}
          sx={{ mb: 4 }}
        >
          <TabList>
            <Tab startDecorator={<UserCircle />}>
              {t('settings.profile', 'Profile')}
            </Tab>
            <Tab startDecorator={<Volume2 />}>
              {t('settings.voice', 'Voice')}
            </Tab>
            <Tab startDecorator={<Palette />}>
              {t('settings.appearance', 'Appearance')}
            </Tab>
            <Tab startDecorator={<Bell />}>
              {t('settings.notifications', 'Notifications')}
            </Tab>
            <Tab startDecorator={<Globe />}>
              {t('settings.language', 'Language')}
            </Tab>
          </TabList>

          {/* Profile Settings */}
          <TabPanel value={0}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 3 }}>
                  {t('settings.profile_settings', 'Profile Settings')}
                </Typography>
                <Typography>
                  Profile settings will be implemented here.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Voice Settings */}
          <TabPanel value={1}>
            <VoiceSettings />
          </TabPanel>

          {/* Appearance Settings */}
          <TabPanel value={2}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 3 }}>
                  {t('settings.appearance_settings', 'Appearance Settings')}
                </Typography>
                <Typography>
                  Appearance settings will be implemented here.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Notification Settings */}
          <TabPanel value={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 3 }}>
                  {t('settings.notification_settings', 'Notification Settings')}
                </Typography>
                <Typography>
                  Notification settings will be implemented here.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Language Settings */}
          <TabPanel value={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography level="title-lg" sx={{ mb: 3 }}>
                  {t('settings.language_settings', 'Language Settings')}
                </Typography>
                <Typography>
                  Language settings will be implemented here.
                </Typography>
              </CardContent>
            </Card>
          </TabPanel>
        </Tabs>
      </Container>
    </Layout>
  );
}

export default withAuth(Settings);