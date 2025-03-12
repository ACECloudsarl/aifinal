// pages/api/images/generate.js - FIXED VERSION
import { generateImage } from "../../../lib/togetherAI";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";

// Helper function to check if a string is a valid MongoDB ObjectID
function isValidObjectId(id) {
  // MongoDB ObjectIDs are 24-character hexadecimal strings
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  try {
    const { prompt, messageId, index = 0 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    
    // Generate the image
    const imageBase64 = await generateImage(prompt);
    
    // If messageId is provided and is a valid ObjectID, store the image in the message metadata
    if (messageId && isValidObjectId(messageId)) {
      try {
        // Get existing message
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { content: true, metadata: true },
        });
        
        if (message) {
          // Remove image tag from content
          const cleanedContent = message.content.replace(/\[\!\|(.*?)\|\!\]/g, '').trim();
          
          // Prepare metadata
          const metadata = message.metadata || {};
          metadata.imagePrompts = metadata.imagePrompts || [];
          metadata.imageData = metadata.imageData || [];
          
          // Add new image data at the specific index (or append if no index)
          if (!metadata.imagePrompts.includes(prompt)) {
            metadata.imagePrompts.push(prompt);
            metadata.imageData.push(imageBase64);
          } else {
            // Replace existing image data at that index
            const existingIndex = metadata.imagePrompts.indexOf(prompt);
            if (existingIndex >= 0) {
              metadata.imageData[existingIndex] = imageBase64;
            }
          }
          
          // Update the message in the database
          await prisma.message.update({
            where: { id: messageId },
            data: {
              content: cleanedContent,
              metadata: metadata,
            },
          });
        }
      } catch (dbError) {
        console.error("Error storing image in database:", dbError);
        // Continue to return the image even if storage fails
      }
    } else if (messageId) {
      // If messageId is provided but not a valid ObjectID (e.g., streaming-id)
      console.log(`Skipping database update for non-ObjectID messageId: ${messageId}`);
    }
    
    res.status(200).json({ 
      success: true, 
      imageData: imageBase64 
    });
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to generate image" 
    });
  }
}