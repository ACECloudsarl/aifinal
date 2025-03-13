// components/chat/VoiceRecorder.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  IconButton, 
  Box, 
  Text, 
  VStack, 
  useToast,
  HStack,
  Spinner,
  Progress,
  Portal,
  Tooltip,
  useColorModeValue,
  Fade,
  Flex,
} from '@chakra-ui/react';
import { 
  FiMic, 
  FiMicOff, 
  FiStopCircle, 
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import speechRecognitionService from '@/lib/SpeechRecognitionService';

const VoiceRecorder = ({ onVoiceRecorded }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [audioLevels, setAudioLevels] = useState([]);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const microphoneStreamRef = useRef(null);
  const toast = useToast();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const bgBubble = useColorModeValue('blue.50', 'blue.900');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  
  // Check if speech recognition is supported
  const isSupported = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

  // Initialize speech recognition and audio context
  useEffect(() => {
    if (!isSupported) {
      return;
    }

    // Initialize speech recognition service
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
      // Set finalizing state to show success indicator
      if (finalText && finalText.trim() !== '') {
        setIsFinalizing(true);
        
        // Wait 1 second before processing the final result
        setTimeout(() => {
          setIsFinalizing(false);
          setIsRecording(false);
          setRecognizedText('');
          onVoiceRecorded(finalText);
        }, 1000);
      } else {
        setIsRecording(false);
        setRecognizedText('');
      }
    });

    return () => {
      if (isRecording) {
        speechRecognitionService.stop();
      }
      
      // Clean up audio visualizer
      if (microphoneStreamRef.current) {
        microphoneStreamRef.current.getTracks().forEach(track => track.stop());
        microphoneStreamRef.current = null;
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [isSupported]);

  // Setup audio visualizer
  const setupAudioVisualizer = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      // Get user media (microphone)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphoneStreamRef.current = stream;
      
      // Create analyzer node
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      const bufferLength = analyserRef.current.frequencyBinCount;
      
      // Create source node from the stream
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Start visualizing
      setIsVisualizing(true);
      
      // Animation function to update levels
      const updateLevels = () => {
        if (!isVisualizing || !analyserRef.current) return;
        
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Simplify to 5 levels
        const simplifiedLevels = [];
        const segmentSize = Math.floor(bufferLength / 5);
        
        for (let i = 0; i < 5; i++) {
          let sum = 0;
          for (let j = 0; j < segmentSize; j++) {
            sum += dataArray[i * segmentSize + j];
          }
          // Normalize (0-100)
          simplifiedLevels.push(Math.floor((sum / segmentSize) * 0.4));
        }
        
        setAudioLevels(simplifiedLevels);
        requestAnimationFrame(updateLevels);
      };
      
      updateLevels();
    } catch (error) {
      console.error("Error setting up audio visualizer:", error);
    }
  };

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
    
    // Setup audio visualizer
    setupAudioVisualizer();
  };

  // Stop recording
  const stopRecording = () => {
    speechRecognitionService.stop();
    clearInterval(timerRef.current);
    setRecordingDuration(0);
    setIsVisualizing(false);
    
    // Clean up audio visualizer
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
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
      <Tooltip label="Speech recognition not supported in this browser">
        <IconButton 
          icon={<FiMicOff />}
          variant="ghost"
          color="gray.500"
          isDisabled
          aria-label="Speech recognition not supported"
        />
      </Tooltip>
    );
  }

  return (
    <Box position="relative">
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
            _dark={{
              bg: 'red.900',
              color: 'red.200',
            }}
          >
            {isFinalizing ? (
              <FiCheckCircle />
            ) : (
              <Spinner size="sm" color="red.500" _dark={{ color: 'red.200' }} />
            )}
            <Text fontWeight="medium">
              {formatTime(recordingDuration)}
            </Text>
          </Box>
          
          <IconButton
            icon={<FiStopCircle />}
            colorScheme="red"
            variant="ghost"
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
      
      {/* Audio visualization */}
      {isRecording && isVisualizing && (
        <Portal>
          <Box
            position="fixed"
            bottom="80px"
            left="50%"
            transform="translateX(-50%)"
            bg={bgColor}
            borderRadius="lg"
            boxShadow="lg"
            p={4}
            maxW="600px"
            width="90%"
            zIndex={1000}
          >
            <VStack spacing={3}>
              <HStack spacing={0} justify="center" w="100%" h="60px">
                {audioLevels.map((level, index) => (
                  <Box 
                    key={index}
                    mx={1}
                    w="20px"
                    h={`${Math.max(5, level)}%`}
                    bg="blue.400"
                    borderRadius="full"
                    transition="height 0.1s ease-in-out"
                  />
                ))}
              </HStack>
              
              <Box
                bg={bgBubble}
                color={textColor}
                p={3}
                borderRadius="lg"
                w="100%"
                minH="60px"
                maxH="150px"
                overflowY="auto"
              >
                {recognizedText ? (
                  <Text>{recognizedText}</Text>
                ) : (
                  <Text color="gray.500" fontStyle="italic">
                    Speak now...
                  </Text>
                )}
              </Box>
              
              <HStack>
                <Text>{formatTime(recordingDuration)}</Text>
                <Box w="150px">
                  <Progress size="xs" value={(recordingDuration % 60) * 1.667} colorScheme="blue" borderRadius="full" />
                </Box>
                <IconButton 
                  size="sm" 
                  icon={<FiStopCircle />} 
                  colorScheme="red" 
                  onClick={stopRecording}
                  aria-label="Stop recording"
                />
              </HStack>
            </VStack>
          </Box>
        </Portal>
      )}
      
      {/* Recognized text bubble */}
      {recognizedText && !isVisualizing && (
        <Box
          position="absolute"
          bottom="100%"
          left={0}
          right={0}
          bg={bgBubble}
          border="1px solid"
          borderColor="blue.200"
          borderRadius="md"
          p={2}
          mb={2}
          boxShadow="md"
          maxHeight="150px"
          overflow="auto"
          minWidth="200px"
          _dark={{
            borderColor: 'blue.700',
          }}
        >
          <Text fontSize="sm" fontStyle="italic" color={textColor}>
            {recognizedText}
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default VoiceRecorder;