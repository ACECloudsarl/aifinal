// services/SpeechRecognitionService.js
class SpeechRecognitionService {
    constructor() {
      this.recognition = null;
      this.isInitialized = false;
      this.isListening = false;
      this.language = 'en-US';
      this.autoDetect = true;
      this.interimResults = '';
      this.finalResults = '';
      
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
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
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
        
        if (this.callbacks.onEnd) {
          this.callbacks.onEnd(this.finalResults);
        }
      };
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
      
      return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }
  }
  
  // Create and export singleton
  const speechRecognitionService = new SpeechRecognitionService();
  export default speechRecognitionService;