// services/VoiceService.js
import { ElevenLabsClient } from 'elevenlabs';

// Audio cache to reduce API calls
const audioCache = new Map();

class VoiceService {
  constructor() {
    this.apiKey = typeof window !== 'undefined' 
      ? window.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
      : process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    
    this.client = null;
    this.currentAudio = null;
    this.isPlaying = false;
    this.voices = [];
    this.isLoaded = false;
    this.userSettings = null;
    
    // Subscribers for voice events
    this.playingSubscribers = [];
    this.stoppedSubscribers = [];
  }

  // Initialize the service
  async initialize() {
    if (!this.apiKey) {
      console.error("ElevenLabs API key is required");
      return false;
    }
    
    try {
      this.client = new ElevenLabsClient({
        apiKey: this.apiKey
      });
      
      // Load voices if not already loaded
      if (!this.isLoaded) {
        await this.loadVoices();
      }
      
      return true;
    } catch (error) {
      console.error("Error initializing ElevenLabs client:", error);
      return false;
    }
  }

  // Get the API client
  getClient() {
    if (!this.client && this.apiKey) {
      this.initialize();
    }
    
    if (!this.client) {
      throw new Error("ElevenLabs client not initialized. Please initialize first.");
    }
    
    return this.client;
  }

  // Load voices from the database
  async loadVoices(forceRefresh = false) {
    if (this.isLoaded && !forceRefresh) {
      return this.voices;
    }
    
    try {
      const response = await fetch('/api/admin/voices');
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      
      this.voices = await response.json();
      this.isLoaded = true;
      return this.voices;
    } catch (error) {
      console.error("Error loading voices:", error);
      this.isLoaded = false;
      return [];
    }
  }

  // Load user voice settings
  async loadUserSettings() {
    try {
      const response = await fetch('/api/user/voice-settings');
      if (response.ok) {
        this.userSettings = await response.json();
        return this.userSettings;
      }
      
      // Return default settings if nothing is found
      this.userSettings = {
        autoTTS: false,
        preferredVoiceId: null,
        speakingRate: 1.0,
        speakingPitch: 1.0,
        inputDetectLanguage: true,
        preferredLanguage: 'en'
      };
      
      return this.userSettings;
    } catch (error) {
      console.error("Error loading user voice settings:", error);
      return null;
    }
  }

  // Save user voice settings
  async saveUserSettings(settings) {
    try {
      const response = await fetch('/api/user/voice-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        this.userSettings = await response.json();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error saving user voice settings:", error);
      return false;
    }
  }

  // Toggle auto TTS
  async toggleAutoTTS() {
    if (!this.userSettings) {
      await this.loadUserSettings();
    }
    
    const newSettings = {
      ...this.userSettings,
      autoTTS: !this.userSettings.autoTTS
    };
    
    const success = await this.saveUserSettings(newSettings);
    if (success) {
      this.userSettings = newSettings;
      return this.userSettings.autoTTS;
    }
    
    return this.userSettings.autoTTS;
  }

  // Subscribe to playing events
  subscribeToPlaying(callback) {
    this.playingSubscribers.push(callback);
    return () => {
      this.playingSubscribers = this.playingSubscribers.filter(cb => cb !== callback);
    };
  }

  // Subscribe to stopped events
  subscribeToStopped(callback) {
    this.stoppedSubscribers.push(callback);
    return () => {
      this.stoppedSubscribers = this.stoppedSubscribers.filter(cb => cb !== callback);
    };
  }

  // Notify subscribers
  notifyPlaying() {
    this.playingSubscribers.forEach(callback => callback());
  }

  notifyStopped() {
    this.stoppedSubscribers.forEach(callback => callback());
  }

  // Get a specific voice by ID
  async getVoice(voiceId) {
    if (!this.isLoaded) {
      await this.loadVoices();
    }
    
    return this.voices.find(voice => voice.id === voiceId);
  }

  // Stop any currently playing audio
  stopAudio() {
    if (this.isPlaying && this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
      this.isPlaying = false;
      this.notifyStopped();
      return true;
    }
    return false;
  }

  // Get voices for a specific language
  getVoicesForLanguage(language) {
    if (!this.isLoaded) {
      return [];
    }
    
    const langCode = language.substring(0, 2).toLowerCase();
    return this.voices.filter(voice => 
      voice.languages && voice.languages.includes(langCode)
    );
  }

  // Generate a cache key for audio requests
  generateCacheKey(text, voiceId, options) {
    return `${voiceId}|${options.speakingRate || 1.0}|${options.speakingPitch || 1.0}|${text}`;
  }

  // Create and play audio from blob/buffer
  async playAudio(audioData) {
    let blobData;
    
    try {
      if (audioData instanceof ArrayBuffer) {
        blobData = new Blob([audioData], { type: 'audio/mpeg' });
      } else if (audioData instanceof Blob) {
        blobData = audioData;
      } else if (typeof audioData === 'object' && audioData !== null) {
        if (audioData.buffer instanceof ArrayBuffer) {
          blobData = new Blob([audioData.buffer], { type: 'audio/mpeg' });
        } else if (audioData.data instanceof ArrayBuffer) {
          blobData = new Blob([audioData.data], { type: 'audio/mpeg' });
        } else {
          console.error("Unable to convert audio data to Blob");
          return Promise.reject(new Error("Unsupported audio data format"));
        }
      } else {
        console.error("Unexpected audio data type");
        return Promise.reject(new Error("Invalid audio data type"));
      }
      
      if (!(blobData instanceof Blob)) {
        return Promise.reject(new Error("Failed to create audio blob"));
      }
      
      const url = URL.createObjectURL(blobData);
      const audio = new Audio(url);
      
      // Set up error handler
      audio.addEventListener('error', (e) => {
        console.error("Audio element error:", e);
      });
      
      // Start playback and return promise
      return new Promise((resolve, reject) => {
        audio.oncanplaythrough = () => {
          const playPromise = audio.play();
          
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Playback error:", error);
              URL.revokeObjectURL(url);
              reject(error);
            });
          }
        };
        
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve(audio);
        };
        
        audio.onerror = (event) => {
          console.error("Audio error:", event);
          URL.revokeObjectURL(url);
          reject(new Error(`Audio playback failed: ${audio.error?.message || 'Unknown error'}`));
        };
      });
    } catch (error) {
      console.error("Audio processing error:", error);
      return Promise.reject(error);
    }
  }

  // Speak text with ElevenLabs API
  async speak(text, voiceId = null, options = {}) {
    if (!text || text.trim() === '') {
      return null;
    }
    
    // Stop any current audio
    this.stopAudio();
    
    try {
      // Make sure we have a client
      const client = this.getClient();
      
      // Use provided voice ID or user preferred voice
      const effectiveVoiceId = voiceId || 
        (this.userSettings?.preferredVoiceId) || 
        this.voices[0]?.externalId;
      
      if (!effectiveVoiceId) {
        console.error("No voice ID available for speech");
        return null;
      }
      
      // If using database voices, get the external ID
      let externalVoiceId = effectiveVoiceId;
      if (this.isLoaded) {
        const voice = this.voices.find(v => v.id === effectiveVoiceId);
        if (voice?.externalId) {
          externalVoiceId = voice.externalId;
        }
      }
      
      // Default and merged options
      const mergedOptions = {
        model_id: "eleven_flash_v2_5", // Cheapest model by default
        output_format: "mp3_44100_128",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: (options.speakingPitch || this.userSettings?.speakingPitch || 1.0) - 1.0, // Map 0-2 to -1 to 1
          use_speaker_boost: true,
          speaking_rate: options.speakingRate || this.userSettings?.speakingRate || 1.0,
        },
        ...options
      };
      
      // Check cache first
      const cacheKey = this.generateCacheKey(
        text, 
        externalVoiceId, 
        {
          speakingRate: mergedOptions.voice_settings.speaking_rate,
          speakingPitch: mergedOptions.voice_settings.style + 1.0
        }
      );
      
      if (audioCache.has(cacheKey)) {
        console.log("Using cached audio");
        
        // Notify subscribers we're playing
        this.isPlaying = true;
        this.notifyPlaying();
        
        // Play the cached audio
        const cachedAudio = audioCache.get(cacheKey);
        const audio = await this.playAudio(cachedAudio);
        
        // Set up event handlers
        this.currentAudio = audio;
        
        audio.onended = () => {
          this.isPlaying = false;
          this.currentAudio = null;
          this.notifyStopped();
          
          if (options.onComplete) {
            options.onComplete();
          }
        };
        
        return audio;
      }
      
      // Call API to convert text to speech
      const audioStream = await client.textToSpeech.convertAsStream(externalVoiceId, {
        text,
        ...mergedOptions
      });
      
      // Convert stream to ArrayBuffer
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      
      // Cache for future use
      audioCache.set(cacheKey, audioBuffer);
      
      // Limit cache size to prevent memory issues
      if (audioCache.size > 20) {
        const keysToDelete = Array.from(audioCache.keys()).slice(0, 5);
        keysToDelete.forEach(key => audioCache.delete(key));
      }
      
      // Notify subscribers we're playing
      this.isPlaying = true;
      this.notifyPlaying();
      
      // Play audio
      const audio = await this.playAudio(audioBuffer);
      this.currentAudio = audio;
      
      // Set up completion handler
      audio.onended = () => {
        this.isPlaying = false;
        this.currentAudio = null;
        this.notifyStopped();
        
        if (options.onComplete) {
          options.onComplete();
        }
      };
      
      return audio;
    } catch (error) {
      console.error("Error generating speech:", error);
      this.isPlaying = false;
      this.currentAudio = null;
      this.notifyStopped();
      
      if (options.onError) {
        options.onError(error);
      }
      
      return null;
    }
  }
}

// Create and export singleton
const voiceService = new VoiceService();
export default voiceService;