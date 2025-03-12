// pages/api/admin/bots/[botId].js
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Check admin permissions (to be implemented with user roles)
  // const admin = await isAdmin(session);
  // if (!admin) {
  //   return res.status(403).json({ message: "Forbidden: Admin access required" });
  // }
  
  const { botId } = req.query;
  
  // GET - Fetch a single bot
  if (req.method === "GET") {
    try {
      const bot = await prisma.bot.findUnique({
        where: { id: botId }
      });
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      return res.status(200).json(bot);
    } catch (error) {
      console.error("Error fetching bot:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  // PUT - Update a bot
  if (req.method === "PUT") {
    try {
      const { name, description, avatar, model, category, prompt } = req.body;
      
      // Validate required fields
      if (!name || !description || !model || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Update the bot
      const updatedBot = await prisma.bot.update({
        where: { id: botId },
        data: {
          name,
          description,
          avatar,
          model,
          category,
          prompt,
          updatedAt: new Date()
        }
      });
      
      return res.status(200).json(updatedBot);
    } catch (error) {
      console.error("Error updating bot:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  // DELETE - Delete a bot
  if (req.method === "DELETE") {
    try {
      // Check if the bot has associated chats
      const chatCount = await prisma.chat.count({
        where: { botId }
      });
      
      if (chatCount > 0) {
        // Optional: Delete all associated chats and messages
        // Or implement a soft delete instead
        
        // For now, we'll prevent deletion if there are associated chats
        return res.status(400).json({ 
          message: "Cannot delete bot with existing chats. Delete all associated chats first or implement a soft delete." 
        });
      }
      
      // Delete the bot
      await prisma.bot.delete({
        where: { id: botId }
      });
      
      return res.status(200).json({ message: "Bot deleted successfully" });
    } catch (error) {
      console.error("Error deleting bot:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  return res.status(405).json({ message: "Method not allowed" });
}