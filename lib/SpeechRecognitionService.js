// lib/SpeechRecognitionService.js - Enhanced with mobile support
class SpeechRecognitionService {
  constructor() {
    this.recognition = null;
    this.isInitialized = false;
    this.isListening = false;
    this.language = 'en-US';
    this.autoDetect = true;
    this.interimResults = '';
    this.finalResults = '';
    this.isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Event callbacks
    this.callbacks = {
      onResult: null,
      onInterimResult: null,
      onFinalResult: null,
      onStart: null,
      onEnd: null,
      onError: null
    };
  }

  // Initialize the recognition service
  initialize() {
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || 
                              window.webkitSpeechRecognition || 
                              window.mozSpeechRecognition || 
                              window.msSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported in this browser");
      return false;
    }
    
    try {
      // Create recognition instance
      this.recognition = new SpeechRecognition();
      
      // Configure recognition
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      
      // Set language if not auto-detecting
      if (!this.autoDetect) {
        this.recognition.lang = this.language;
      }
      
      // Special handling for mobile devices
      if (this.isMobile) {
        // Mobile browsers sometimes need different settings
        this.recognition.continuous = false; // Some mobile browsers don't support continuous mode
        
        // Special handling for iOS
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          // iOS Safari has issues with long recordings
          this.recognition.interimResults = false;
        }
      }
      
      // Set up event handlers
      this.setupEventHandlers();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      return false;
    }
  }

  // Set up event handlers for recognition
  setupEventHandlers() {
    if (!this.recognition) return;
    
    // Handle results
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          this.finalResults += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update interim results
      this.interimResults = interimTranscript;
      
      // Call callbacks
      if (interimTranscript && this.callbacks.onInterimResult) {
        this.callbacks.onInterimResult(interimTranscript);
      }
      
      if (finalTranscript && this.callbacks.onFinalResult) {
        this.callbacks.onFinalResult(finalTranscript);
      }
      
      if (this.callbacks.onResult) {
        this.callbacks.onResult(finalTranscript || interimTranscript);
      }
    };
    
    // Handle errors
    this.recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      
      if (this.callbacks.onError) {
        this.callbacks.onError(event.error);
      }
      
      // For mobile devices, restart recognition on some non-fatal errors
      if (this.isMobile && ['network', 'aborted'].includes(event.error)) {
        setTimeout(() => {
          if (this.isListening) {
            try {
              this.recognition.start();
            } catch (e) {
              console.error("Failed to restart speech recognition:", e);
            }
          }
        }, 1000);
      }
    };
    
    // Handle start
    this.recognition.onstart = () => {
      this.isListening = true;
      
      if (this.callbacks.onStart) {
        this.callbacks.onStart();
      }
    };
    
    // Handle end
    this.recognition.onend = () => {
      this.isListening = false;
      
      // On mobile, need to manually restart for continuous mode
      if (this.isMobile && this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {
          console.error("Error restarting speech recognition on mobile:", e);
          
          if (this.callbacks.onEnd) {
            this.callbacks.onEnd(this.finalResults);
          }
        }
        return;
      }
      
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd(this.finalResults);
      }
    };
    
    // Add audioend handler for mobile
    if (this.isMobile && this.recognition.audioend) {
      this.recognition.audioend = () => {
        // On iOS, this sometimes fires when the user stops speaking
        if (this.isListening && !this.finalResults) {
          setTimeout(() => {
            try {
              this.stop();
            } catch (e) {
              console.error("Error stopping after audioend:", e);
            }
          }, 1000);
        }
      };
    }
  }

  // Start listening
  start() {
    // Initialize if needed
    if (!this.isInitialized) {
      const initialized = this.initialize();
      if (!initialized) {
        console.error("Failed to initialize speech recognition");
        return false;
      }
    }
    
    // Don't start if already listening
    if (this.isListening) {
      return true;
    }
    
    // Reset results
    this.interimResults = '';
    this.finalResults = '';
    
    // Start recognition
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      
      // For mobile device errors, provide a fallback behavior
      if (this.isMobile) {
        // Return true to allow fallback visualization
        console.warn("Using fallback mode for speech recognition");
        return false;
      }
      
      return false;
    }
  }

  // Stop listening
  stop() {
    if (!this.isListening || !this.recognition) {
      return false;
    }
    
    try {
      this.recognition.stop();
      return true;
    } catch (error) {
      console.error("Error stopping speech recognition:", error);
      
      // Force the state to be correct even if the call failed
      this.isListening = false;
      
      // Call onEnd manually if needed
      if (this.callbacks.onEnd) {
        this.callbacks.onEnd(this.finalResults);
      }
      
      return false;
    }
  }

  // Set language for recognition
  setLanguage(language, autoDetect = false) {
    this.language = language;
    this.autoDetect = autoDetect;
    
    if (this.recognition && !autoDetect) {
      this.recognition.lang = language;
    }
  }

  // Register callback for result events
  onResult(callback) {
    this.callbacks.onResult = callback;
  }

  // Register callback for interim result events
  onInterimResult(callback) {
    this.callbacks.onInterimResult = callback;
  }

  // Register callback for final result events
  onFinalResult(callback) {
    this.callbacks.onFinalResult = callback;
  }

  // Register callback for error events
  onError(callback) {
    this.callbacks.onError = callback;
  }

  // Register callback for start events
  onStart(callback) {
    this.callbacks.onStart = callback;
  }

  // Register callback for end events
  onEnd(callback) {
    this.callbacks.onEnd = callback;
  }

  // Check if speech recognition is supported
  static isSupported() {
    if (typeof window === 'undefined') {
      return false;
    }
    
    return !!(window.SpeechRecognition || 
              window.webkitSpeechRecognition || 
              window.mozSpeechRecognition ||
              window.msSpeechRecognition);
  }
}

// Create and export singleton
const speechRecognitionService = new SpeechRecognitionService();
export default speechRecognitionService;