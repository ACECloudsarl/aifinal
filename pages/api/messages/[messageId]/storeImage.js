// pages/api/messages/[messageId]/storeImage.js - UPDATED FOR R2
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  const { messageId } = req.query;
  const { prompt, imageUrl, index = 0 } = req.body;
  
  if (!prompt || !imageUrl) {
    return res.status(400).json({ message: "Prompt and imageUrl are required" });
  }
  
  try {
    console.log(`Storing image URL for message ${messageId}, prompt: ${prompt.substring(0, 30)}...`);
    
    // Get the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { content: true, metadata: true, chatId: true },
    });
    
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if the user has access to this message
    const chat = await prisma.chat.findFirst({
      where: {
        id: message.chatId,
        userId: session.user.id,
      },
    });
    
    if (!chat) {
      return res.status(403).json({ message: "You don't have access to this message" });
    }
    
    // Remove image tag from content
    const cleanedContent = message.content.replace(/\[\!\|(.*?)\|\!\]/g, '').trim();
    
    // Prepare metadata
    const metadata = message.metadata || {};
    metadata.imagePrompts = metadata.imagePrompts || [];
    metadata.imageUrls = metadata.imageUrls || [];
    
    // Add or update image URL
    if (!metadata.imagePrompts.includes(prompt)) {
      console.log(`Adding new prompt: ${prompt.substring(0, 30)}...`);
      metadata.imagePrompts.push(prompt);
      metadata.imageUrls.push(imageUrl);
    } else {
      // Replace existing image at that index
      const existingIndex = metadata.imagePrompts.indexOf(prompt);
      if (existingIndex >= 0) {
        console.log(`Updating existing prompt at index ${existingIndex}`);
        metadata.imageUrls[existingIndex] = imageUrl;
      }
    }
    
    // Log the updated metadata structure
    console.log(`Updated metadata structure:`, {
      promptsCount: metadata.imagePrompts.length,
      urlsCount: metadata.imageUrls.length
    });
    
    // Update the message
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: cleanedContent,
        metadata: metadata,
      },
    });
    
    console.log(`Message updated successfully. Metadata now has ${updatedMessage.metadata?.imagePrompts?.length || 0} prompts`);
    
    res.status(200).json({ 
      success: true,
      metadata: {
        promptsCount: metadata.imagePrompts.length,
        urlsCount: metadata.imageUrls.length
      }
    });
  } catch (error) {
    console.error("Error storing image:", error);
    res.status(500).json({ message: "Failed to store image", error: error.message });
  }
}