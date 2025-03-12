// lib/imageGenerationService.js
// A singleton service for image generation that exists outside the React rendering cycle

// Cache of generated images by prompt
const imageCache = new Map();

// Track in-progress generations to prevent duplicates
const pendingGenerations = new Map();

// List of callbacks registered for image updates
const subscribers = new Map();

// Counter for subscription IDs
let nextSubscriberId = 0;

/**
 * Image Generation Service
 * - Handles image generation outside of React rendering
 * - Maintains a cache of generated images
 * - Prevents duplicate generation requests
 * - Notifies subscribers when images are ready
 */
class ImageGenerationService {
  /**
   * Generate an image for a given prompt
   * @param {string} prompt - The prompt to generate an image for
   * @returns {Promise<string>} - A promise that resolves to the image URL
   */
  async generateImage(prompt) {
    // Check cache first
    if (imageCache.has(prompt)) {
      console.log(`[ImageService] Using cached image for: ${prompt.substring(0, 30)}...`);
      return imageCache.get(prompt);
    }

    // Check if generation is already in progress
    if (pendingGenerations.has(prompt)) {
      console.log(`[ImageService] Generation already in progress for: ${prompt.substring(0, 30)}...`);
      return pendingGenerations.get(prompt);
    }

    // Create a new promise for this generation
    console.log(`[ImageService] Starting generation for: ${prompt.substring(0, 30)}...`);
    const generationPromise = this._doGenerateImage(prompt);
    pendingGenerations.set(prompt, generationPromise);

    try {
      const imageUrl = await generationPromise;
      // Cache the result
      imageCache.set(prompt, imageUrl);
      // Notify subscribers
      this._notifySubscribers(prompt, imageUrl);
      return imageUrl;
    } finally {
      // Clean up pending generation
      pendingGenerations.delete(prompt);
    }
  }

  /**
   * Internal method to actually generate the image
   * @private
   */
  async _doGenerateImage(prompt) {
    try {
      const response = await fetch('/api/images/generate-and-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();

      if (!data.success || !data.url) {
        throw new Error('Failed to get image URL');
      }

      console.log(`[ImageService] Generation completed: ${data.url}`);
      return data.url;
    } catch (error) {
      console.error(`[ImageService] Generation error:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to image generation updates
   * @param {Function} callback - Function to call when images are generated
   * @returns {number} - Subscription ID for unsubscribing
   */
  subscribe(callback) {
    const id = nextSubscriberId++;
    subscribers.set(id, callback);
    return id;
  }

  /**
   * Unsubscribe from image generation updates
   * @param {number} id - Subscription ID from subscribe()
   */
  unsubscribe(id) {
    subscribers.delete(id);
  }

  /**
   * Notify subscribers when an image is generated
   * @private
   */
  _notifySubscribers(prompt, imageUrl) {
    for (const callback of subscribers.values()) {
      try {
        callback(prompt, imageUrl);
      } catch (error) {
        console.error('[ImageService] Error in subscriber callback:', error);
      }
    }
  }

  /**
   * Check if an image is already in the cache
   * @param {string} prompt - The prompt to check
   * @returns {string|null} - The cached image URL or null
   */
  getCachedImage(prompt) {
    return imageCache.has(prompt) ? imageCache.get(prompt) : null;
  }

  /**
   * Save an image to the database for a message
   * @param {string} messageId - The message ID to update
   * @param {string} prompt - The image prompt
   * @param {string} imageUrl - The image URL
   * @param {number} index - The index of the image
   * @returns {Promise<boolean>} - Whether the update was successful
   */
  async saveToDatabase(messageId, prompt, imageUrl, index = 0) {
    if (!messageId || messageId.startsWith('streaming-') || messageId.startsWith('temp-')) {
      console.log(`[ImageService] Skipping save for temporary message ID: ${messageId}`);
      return false;
    }

    try {
      console.log(`[ImageService] Saving to database for message: ${messageId}`);
      const response = await fetch(`/api/messages/${messageId}/storeImage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageUrl,
          index
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to store image in database');
      }

      console.log(`[ImageService] Successfully saved to database for message: ${messageId}`);
      return true;
    } catch (error) {
      console.error('[ImageService] Error saving to database:', error);
      return false;
    }
  }
}

// Create and export a singleton instance
const imageService = new ImageGenerationService();
export default imageService;