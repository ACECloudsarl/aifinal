// components/chat/VoiceRecorder.js
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  CircularProgress,
  Typography,
  IconButton,
} from '@mui/joy';
import {
  Mic,
  X,
} from 'lucide-react';

const VoiceRecorder = ({ onVoiceRecorded }) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        onVoiceRecorded(audioBlob);
        setIsRecording(false);
        setRecordingDuration(0);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval(timerRef.current);
      mediaRecorderRef.current.stop();
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {isRecording ? (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'error.softBg', 
            px: 2, 
            py: 1, 
            borderRadius: 'xl',
            gap: 1,
          }}>
            <CircularProgress size="sm" color="error" />
            <Typography level="body-sm" color="error">
              {formatTime(recordingDuration)}
            </Typography>
          </Box>
          <IconButton 
            color="danger" 
            variant="soft" 
            onClick={stopRecording}
          >
            <X size={18} />
          </IconButton>
        </>
      ) : (
        <IconButton
          color="neutral"
          variant="plain"
          onTouchStart={startRecording}
          onMouseDown={startRecording}
          onTouchEnd={stopRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
        >
          <Mic size={20} />
        </IconButton>
      )}
    </Box>
  );
};

export default VoiceRecorder;