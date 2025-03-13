// components/chat/VoiceRecorder.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  IconButton, 
  Box, 
  Text, 
  VStack, 
  useToast,
  HStack,
  Spinner
} from '@chakra-ui/react';
import { 
  FiMic, 
  FiMicOff, 
  FiStopCircle 
} from 'react-icons/fi';
import speechRecognitionService from '@/lib/SpeechRecognitionService';

const VoiceRecorder = ({ onVoiceRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const timerRef = useRef(null);
  const toast = useToast();
  
  // Check if speech recognition is supported
  const isSupported = speechRecognitionService.isSupported;

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      toast({
        title: "Speech Recognition Unsupported",
        description: "Your browser does not support speech recognition.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
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
      toast({
        title: "Speech Recognition Error",
        description: errMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
    if (!isSupported) return;

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
      <IconButton 
        icon={<FiMicOff />}
        variant="ghost"
        color="gray.500"
        isDisabled
        aria-label="Speech recognition not supported"
      />
    );
  }

  return (
    <VStack spacing={2} align="stretch" position="relative">
      {isRecording ? (
        <HStack spacing={2}>
          <Box
            bg="red.50"
            color="red.500"
            px={3}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Spinner size="sm" color="red.500" />
            <Text fontWeight="medium">
              {formatTime(recordingDuration)}
            </Text>
          </Box>
          
          <IconButton
            icon={<FiStopCircle />}
            colorScheme="red"
            variant="outline"
            onClick={stopRecording}
            aria-label="Stop Recording"
          />
        </HStack>
      ) : (
        <IconButton
          icon={<FiMic />}
          variant="ghost"
          onClick={startRecording}
          aria-label="Start Voice Recording"
        />
      )}
      
      {recognizedText && (
        <Box
          position="absolute"
          bottom="100%"
          left={0}
          right={0}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          p={2}
          mb={2}
          boxShadow="md"
          maxHeight="150px"
          overflow="auto"
        >
          <Text fontSize="sm" fontStyle="italic" color="gray.600">
            {recognizedText}
          </Text>
        </Box>
      )}
    </VStack>
  );
};

export default VoiceRecorder;