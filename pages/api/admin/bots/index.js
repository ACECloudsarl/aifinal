// pages/api/admin/bots/index.js
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

// Admin role verification
const isAdmin = async (session) => {
  if (!session) return false;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    
    return user?.role === 'ADMIN';
  } catch (error) {
    return false;
  }
};

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
  
  // GET - Fetch all bots
  if (req.method === "GET") {
    try {
      const bots = await prisma.bot.findMany({
        orderBy: {
          createdAt: "desc"
        }
      });
      
      return res.status(200).json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  // POST - Create a new bot
  if (req.method === "POST") {
    try {
      const { name, description, avatar, model, category, prompt } = req.body;
      
      // Validate required fields
      if (!name || !description || !model || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Create the bot
      const bot = await prisma.bot.create({
        data: {
          name,
          description,
          avatar: avatar || `/images/bots/default.png`,
          model,
          category,
          prompt: prompt || "You are a helpful AI assistant."
        }
      });
      
      return res.status(201).json(bot);
    } catch (error) {
      console.error("Error creating bot:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  return res.status(405).json({ message: "Method not allowed" });
}