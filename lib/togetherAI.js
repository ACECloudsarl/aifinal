// lib/togetherAI.js
import Together from "together-ai";

// Create a Together AI client
export const createTogetherAIClient = () => {
  return new Together({
    apiKey: process.env.TOGETHER_API_KEY,
  });
};

// Function to generate text completion
export const generateCompletion = async (messages, model, options = {}) => {
  const together = createTogetherAIClient();
  
  const defaultOptions = {
    max_tokens: 512,
    temperature: 0.7,
    top_p: 0.7,
    top_k: 50,
    repetition_penalty: 1,
    stream: false,
  };
  
  try {
    const response = await together.chat.completions.create({
      messages,
      model: model || "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      ...defaultOptions,
      ...options,
    });
    
    return response;
  } catch (error) {
    console.error("Together AI API error:", error);
    throw error;
  }
};

// Function to generate images using FLUX.1-schnell
export const generateImage = async (prompt) => {
  try {
    const together = createTogetherAIClient();
    
    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt,
      width: 1024,
      height: 1024,
      steps: 4,
      n: 1,
      response_format: "b64_json"
    });
    
    return response.data[0].b64_json;
  } catch (error) {
    console.error("Image generation error:", error);
    throw error;
  }
};