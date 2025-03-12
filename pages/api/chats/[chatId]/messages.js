// pages/api/chats/[chatId]/messages.js - Refactored without custom prompts

import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { generateCompletion, generateImage } from "../../../../lib/togetherAI";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { chatId } = req.query;
  const { stream } = req.query; // Check if streaming is requested via query param

  // Verify user owns this chat
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: session.user.id,
    },
    include: {
      bot: true,
    },
  });

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  if (req.method === "GET") {
    // Handle streaming GET request if stream parameter is present
    if (stream === "true") {
      // This will handle the streaming response
      handleStreamingResponse(req, res, chatId, chat, session);
      return;
    }

    // Regular GET request for messages
    try {
      const messages = await prisma.message.findMany({
        where: {
          chatId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  if (req.method === "POST") {
    try {
      const { content } = req.body;

      // Create user message
      const userMessage = await prisma.message.create({
        data: {
          content,
          role: "user",
          chatId,
        },
      });

      // Check if this is an image generation request
      const imageRegex = /generate\s+(an?|some)\s+image|create\s+(an?|some)\s+image|draw\s+(an?|some)|make\s+(an?|some)\s+image/i;
      const isImageRequest = imageRegex.test(content);
      
      let assistantMessage;
      
      if (isImageRequest) {
        // Handle image generation
        try {
          // Extract the image prompt - everything after the "generate an image of" part
          const promptRegex = /(?:generate|create|draw|make)\s+(?:an?|some)\s+(?:image|picture|drawing|illustration)?\s*(?:of|about|with|showing)?\s*(.*)/i;
          const matches = content.match(promptRegex);
          const imagePrompt = matches && matches[1] ? matches[1].trim() : content;
          
          if (!imagePrompt) {
            throw new Error("Couldn't determine what image to generate");
          }
          
          // Generate image using FLUX.1-schnell
          const imageBase64 = await generateImage(imagePrompt);
          
          // Create a response message that includes the image
          assistantMessage = await prisma.message.create({
            data: {
              content: `I've generated an image based on your request: "${imagePrompt}"`,
              role: "assistant",
              chatId,
              metadata: {
                imageBase64,
                prompt: imagePrompt
              },
            },
          });
          
          // Return the assistant message with the image data
          return res.status(201).json({
            ...assistantMessage,
            imageData: imageBase64
          });
        } catch (error) {
          console.error("Image generation error:", error);
          
          // Fall back to text response if image generation fails
          const errorResponse = await generateCompletion(
            [
              {
                role: "system",
                content: `The user requested an image, but image generation failed with error: ${error.message}. Please apologize and offer alternative assistance.`
              },
              {
                role: "user",
                content: content
              }
            ],
            chat.bot.model,
            { stream: false }
          );
          
          assistantMessage = await prisma.message.create({
            data: {
              content: errorResponse.choices[0].message.content,
              role: "assistant",
              chatId,
              tokens: errorResponse.usage?.total_tokens || 0,
            },
          });
        }
      } else {
        // Handle normal text completion
        // Get last 10 messages for context
        const previousMessages = await prisma.message.findMany({
          where: {
            chatId,
          },
          orderBy: {
            createdAt: "asc",
          },
          take: 10,
        });
        
        // Format messages for Together AI
        const formattedMessages = previousMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
        
        // Add system message with bot's prompt from database
        if (formattedMessages.length > 0) {
          formattedMessages.unshift({
            role: "system",
            content: chat.bot.prompt
          });
        }
        
        // Generate the response
        const response = await generateCompletion(
          formattedMessages,
          chat.bot.model,
          { stream: false }
        );
        
        assistantMessage = await prisma.message.create({
          data: {
            content: response.choices[0].message.content,
            role: "assistant",
            chatId,
            tokens: response.usage?.total_tokens || 0,
          },
        });
      }

      // Update chat title for new chats
      if (chat.title === "New Chat") {
        // Generate a title based on the first user message
        const suggestedTitle = content.substring(0, 30) + (content.length > 30 ? "..." : "");
        await prisma.chat.update({
          where: { id: chatId },
          data: { title: suggestedTitle },
        });
      }

      return res.status(201).json(assistantMessage);
    } catch (error) {
      console.error("Error creating message:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

// Separate function to handle streaming response
async function handleStreamingResponse(req, res, chatId, chat, session) {
  // Set correct headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // For Nginx
  
  try {
    const { content } = req.query; // Get content from query string for GET requests
    
    if (!content) {
      res.write(`data: ${JSON.stringify({ error: "Content is required" })}\n\n`);
      res.end();
      return;
    }
    
    // Get last 10 messages for context
    const previousMessages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 10,
    });
    
    // Format messages for Together AI
    const formattedMessages = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Add the new user message
    formattedMessages.push({
      role: "user",
      content: content
    });
    
    // Add system message with bot's prompt from database
    formattedMessages.unshift({
      role: "system",
      content: chat.bot.prompt
    });
    
    // Create user message in database
    await prisma.message.create({
      data: {
        content,
        role: "user",
        chatId,
      },
    });
    
    // Call Together AI API with streaming enabled
    const together = await generateCompletion(
      formattedMessages,
      chat.bot.model,
      { stream: true }
    );
    
    let fullContent = '';
    
    // Stream the response chunks to the client
    for await (const chunk of together) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        
        // Send event in correct SSE format
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
        
        // Flush the response
        if (res.flush) {
          res.flush();
        }
      }
    }
    
    // Once streaming is complete, save the message to the database
    const assistantMessage = await prisma.message.create({
      data: {
        content: fullContent,
        role: "assistant",
        chatId,
        tokens: fullContent.length / 4, // Rough estimate
      },
    });
    
    // Send the final message ID
    res.write(`data: ${JSON.stringify({ done: true, messageId: assistantMessage.id })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error in streaming:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}