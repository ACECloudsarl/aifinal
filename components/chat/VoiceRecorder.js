// components/chat/VoiceRecorder.js
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Box,
  Snackbar,
} from '@mui/joy';
import { Mic, MicOff, StopCircle } from 'lucide-react';
import speechRecognitionService from '@/lib/SpeechRecognitionService';

const VoiceRecorder = ({ onVoiceRecorded }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState('');
  const timerRef = useRef(null);
  const isSupported = speechRecognitionService.isSupported;

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    // Initialize service
    speechRecognitionService.initialize();

    // Set up event handlers
    speechRecognitionService.onInterimResult((text) => {
      setRecognizedText(text);
    });

    speechRecognitionService.onFinalResult((text) => {
      setRecognizedText(text);
    });

    speechRecognitionService.onError((errMsg) => {
      setError(`Speech recognition error: ${errMsg}`);
      stopRecording();
    });

    speechRecognitionService.onEnd((finalText) => {
      if (finalText && finalText.trim() !== '') {
        onVoiceRecorded(finalText);
      }
      setIsRecording(false);
      setRecognizedText('');
    });

    return () => {
      if (isRecording) {
        speechRecognitionService.stop();
      }
    };
  }, [isSupported]);

  // Start recording
  const startRecording = () => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setError('');
    setRecognizedText('');
    setIsRecording(true);
    
    // Start speech recognition
    speechRecognitionService.start();
    
    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  // Stop recording
  const stopRecording = () => {
    speechRecognitionService.stop();
    clearInterval(timerRef.current);
    setRecordingDuration(0);
  };

  // Format time (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If speech recognition is not supported
  if (!isSupported) {
    return (
      <Tooltip title="Speech recognition not supported in your browser">
        <IconButton 
          color="neutral" 
          variant="plain"
          disabled
        >
          <Mic size={20} />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <>
      {isRecording ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.5,
              borderRadius: 'pill',
              bgcolor: 'danger.softBg',
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.6 },
                '100%': { opacity: 1 },
              },
            }}
          >
            <CircularProgress size="sm" color="danger" />
            <Typography color="danger" fontWeight="md">
              {formatTime(recordingDuration)}
            </Typography>
          </Box>
          
          <Tooltip title={t('chat.stop_recording', 'Stop Recording')}>
            <IconButton 
              color="danger"
              variant="soft" 
              onClick={stopRecording}
            >
              <StopCircle size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Tooltip title={t('chat.start_voice', 'Voice Input')}>
          <IconButton
            color="neutral"
            variant="plain"
            onClick={startRecording}
          >
            <Mic size={20} />
          </IconButton>
        </Tooltip>
      )}
      
      {recognizedText && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            right: 0,
            p: 2,
            bgcolor: 'background.surface',
            borderRadius: 'md',
            boxShadow: 'md',
            maxHeight: '150px',
            overflow: 'auto',
            mb: 1,
            border: '1px solid',
            borderColor: 'divider',
            zIndex: 100,
          }}
        >
          <Typography level="body-sm" fontStyle="italic">
            {recognizedText}
          </Typography>
        </Box>
      )}
      
      <Snackbar
        open={!!error}
        onClose={() => setError('')}
        color="danger"
        variant="soft"
        autoHideDuration={5000}
      >
        {error}
      </Snackbar>
    </>
  );
};

export default VoiceRecorder;