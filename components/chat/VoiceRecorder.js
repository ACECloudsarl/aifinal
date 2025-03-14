// components/chat/VoiceRecorder.js - Optimized for mobile
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Text,  
  Portal, 
  VStack,
  HStack,
  Button,
  Progress,
  Center,
  Spinner,
  useToast,
  useColorModeValue,
  Textarea,
  FormControl,
  FormLabel,
  Switch
} from '@chakra-ui/react';
import { FiMic, FiSend, FiStopCircle, FiEdit } from 'react-icons/fi';

const VoiceRecorder = ({ onVoiceRecorded, isRecording, setIsRecording }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioChunks, setAudioChunks] = useState([]);
  const [manualMode, setManualMode] = useState(false);
  const [manualText, setManualText] = useState('');
  const [mimeType, setMimeType] = useState('audio/webm');
  
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const toast = useToast();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const boxBg = useColorModeValue('gray.100', 'gray.700');
  
  // Detect supported MIME types on component mount
  useEffect(() => {
    // Check which audio formats are supported
    const checkSupportedMimeTypes = () => {
      const types = [
        'audio/webm',
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/ogg',
        'audio/wav',
        'audio/mpeg'
      ];
      
      // MediaRecorder.isTypeSupported is only available in secure contexts (HTTPS)
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported) {
        for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
            console.log(`Browser supports recording with MIME type: ${type}`);
            setMimeType(type);
            return type;
          }
        }
      }
      
      // If no types are supported or we can't check, default to webm
      console.log('Could not detect supported MIME types, defaulting to audio/webm');
      return 'audio/webm';
    };
    
    checkSupportedMimeTypes();
  }, []);
  
  // Start recording when isRecording becomes true
  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    
    return () => cleanup();
  }, [isRecording]);
  
  // Start recording function
  const startRecording = async () => {
    try {
      setAudioChunks([]);
      setRecordingTime(0);
      
      // Request microphone access with specific constraints for better audio quality
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        } 
      });
      streamRef.current = stream;
      
      console.log(`Starting recording with MIME type: ${mimeType}`);
      
      // Create media recorder with detected MIME type
      try {
        recorderRef.current = new MediaRecorder(stream, { mimeType });
      } catch (e) {
        console.warn(`Failed to create recorder with ${mimeType}, trying without type specification`);
        recorderRef.current = new MediaRecorder(stream);
      }
      
      // Set up event handlers
      recorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Received audio chunk: ${event.data.size} bytes, type: ${event.data.type}`);
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(time => {
          // Auto-stop after 15 seconds (shorter for better mobile support)
          if (time >= 15) {
            stopRecording();
            return 0;
          }
          return time + 1;
        });
      }, 1000);
      
      // Start recording - collect data more frequently for better chunks
      recorderRef.current.start(100);
   
      
    } catch (error) {
      console.error("Error starting recording:", error);
      setIsRecording(false);
      setManualMode(true);
      
      toast({
        title: "Recording Error",
        description: "Using manual text input instead",
        status: "warning",
        duration: 3000,
      });
    }
  };
  
  // Stop recording and process audio
  const stopRecording = async () => {
    if (!recorderRef.current || recorderRef.current.state === 'inactive') {
      cleanup();
      return;
    }
    
    try {
      // Stop the recorder
      recorderRef.current.stop();
      
      // Wait a moment to ensure all data is collected
      setTimeout(() => {
        // Process the recorded audio if we have chunks
        if (audioChunks.length > 0) {
          processAudio();
        } else {
          console.warn("No audio chunks recorded");
          setManualMode(true);
        }
      }, 500);
    } catch (error) {
      console.error("Error stopping recording:", error);
      cleanup();
      setManualMode(true);
    }
  };
  
  // Clean up resources
  const cleanup = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop media recorder
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      try {
        recorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping recorder:", e);
      }
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  // Process audio with OpenAI
  const processAudio = async () => {
    setIsProcessing(true);
    
    try {
      // Get MIME type from recorder or use default
      const actualMimeType = recorderRef.current?.mimeType || mimeType || 'audio/webm';
      console.log(`Creating blob with MIME type: ${actualMimeType}`);
      
      // Create audio blob
      const audioBlob = new Blob(audioChunks, { type: actualMimeType });
      console.log(`Audio blob created: ${audioBlob.size} bytes`);
      
      // Check if blob is empty or too small
      if (audioBlob.size < 1000) {
        console.warn("Audio recording too short:", audioBlob.size);
        throw new Error("Audio recording too short");
      }
      
      // Create form data
      const formData = new FormData();
      
      // Add audio file with explicit filename including extension
      const extension = actualMimeType.split('/')[1]?.split(';')[0] || 'webm';
      formData.append('audio', audioBlob, `recording.${extension}`);
      
      // Add language parameter
      formData.append('language', 'en');
      
      console.log(`Sending audio blob (${audioBlob.size} bytes) to server for transcription`);
      console.log(`File name: recording.${extension}`);
      
      // Send to API
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      console.log("Transcription response status:", response.status);
      
      if (!response.ok) {
        let errorText = 'Transcription failed';
        try {
          const errorData = await response.json();
          console.error("Transcription API error:", errorData);
          errorText = errorData.error || errorText;
        } catch (e) {
          console.error("Could not parse error response:", e);
        }
        throw new Error(errorText);
      }
      
      const data = await response.json();
      console.log("Transcription result:", data);
      
      if (data.transcript && data.transcript.trim()) {
        onVoiceRecorded(data.transcript);
     
      } else {
        throw new Error("No speech detected");
      }
      
    } catch (error) {
      console.error("Processing error:", error);
      setManualMode(true);
      
      toast({
        title: "Transcription Failed",
        description: "Please type your message instead",
        status: "warning",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
      if (!manualMode) {
        setIsRecording(false);
      }
      setAudioChunks([]);
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Manual cancel
  const handleCancel = () => {
    cleanup();
    setIsRecording(false);
    setAudioChunks([]);
    setManualMode(false);
    setManualText('');
  };
  
  // Submit manual text
  const handleSubmitManual = () => {
    if (manualText.trim()) {
      onVoiceRecorded(manualText.trim());
      setManualText('');
      setIsRecording(false);
      setManualMode(false);
    } else {
      toast({
        title: "Please enter text",
        status: "warning",
        duration: 2000
      });
    }
  };
  
  // If not recording or processing, don't render anything
  if (!isRecording && !isProcessing && !manualMode) return null;
  
  return (
    <Portal>
      <Box
        position="fixed"
        bottom="80px"
        left="20px"
        right="20px"
        bg={bgColor}
        p={4}
        borderRadius="md"
        boxShadow="lg"
        zIndex={1000}
      >
        <VStack spacing={3}>
          <HStack width="100%" justifyContent="space-between">
            <Text fontWeight="bold">
              {manualMode 
                ? "Manual Text Input" 
                : isProcessing 
                  ? "Processing Audio..." 
                  : `Recording... ${formatTime(recordingTime)}`}
            </Text>
            
            {!isProcessing && (
              <FormControl display="flex" alignItems="center" width="auto">
                <FormLabel htmlFor="manual-mode" mb="0" fontSize="sm" mr={2}>
                  Manual Input
                </FormLabel>
                <Switch 
                  id="manual-mode" 
                  isChecked={manualMode} 
                  onChange={() => setManualMode(!manualMode)} 
                  colorScheme="blue"
                />
              </FormControl>
            )}
          </HStack>
          
          {isRecording && !manualMode && (
            <Progress 
              value={(recordingTime / 15) * 100} 
              size="xs" 
              colorScheme="red" 
              width="100%" 
              isAnimated
            />
          )}
          
          {manualMode ? (
            <Textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Type your message here..."
              size="md"
              rows={4}
              resize="none"
              autoFocus
            />
          ) : (
            <Center 
              p={4} 
              bg={boxBg} 
              borderRadius="md" 
              w="100%"
              minH="80px"
              position="relative"
            >
              {isProcessing ? (
                <VStack>
                  <Spinner size="md" />
                  <Text>Transcribing audio...</Text>
                </VStack>
              ) : (
                <VStack spacing={2}>
                  <Box
                    width="60px"
                    height="60px"
                    borderRadius="full"
                    bg="red.500"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    animation="pulse 1.5s infinite"
                  >
                    <FiMic size={24} color="white" />
                  </Box>
                  <Text>Speak clearly...</Text>
                </VStack>
              )}
            </Center>
          )}
          
          <HStack spacing={4} width="100%">
            <Button
              leftIcon={<FiStopCircle />}
              colorScheme="red"
              onClick={handleCancel}
              flex="1"
            >
              Cancel
            </Button>
            
            <Button
              leftIcon={manualMode ? <FiSend /> : <FiSend />}
              colorScheme="blue"
              onClick={manualMode ? handleSubmitManual : stopRecording}
              flex="1"
              isDisabled={isProcessing}
            >
              {manualMode ? "Submit Text" : "Done Recording"}
            </Button>
          </HStack>
        </VStack>
      </Box>
      
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          }
        }
      `}</style>
    </Portal>
  );
};

export default VoiceRecorder;