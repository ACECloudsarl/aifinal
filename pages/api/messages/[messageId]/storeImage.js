// pages/api/messages/[messageId]/storeImage.js
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
  const { prompt, imageData, index = 0 } = req.body;
  
  if (!prompt || !imageData) {
    return res.status(400).json({ message: "Prompt and imageData are required" });
  }
  
  try {
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
    metadata.imageData = metadata.imageData || [];
    
    // Add or update image data
    if (!metadata.imagePrompts.includes(prompt)) {
      metadata.imagePrompts.push(prompt);
      metadata.imageData.push(imageData);
    } else {
      // Replace existing image at that index
      const existingIndex = metadata.imagePrompts.indexOf(prompt);
      if (existingIndex >= 0) {
        metadata.imageData[existingIndex] = imageData;
      }
    }
    
    // Update the message
    await prisma.message.update({
      where: { id: messageId },
      data: {
        content: cleanedContent,
        metadata: metadata,
      },
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error storing image:", error);
    res.status(500).json({ message: "Failed to store image", error: error.message });
  }
}