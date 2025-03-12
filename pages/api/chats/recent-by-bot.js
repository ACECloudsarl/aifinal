// pages/api/chats/recent-by-bot.js

import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get all bots
    const bots = await prisma.bot.findMany({
      select: {
        id: true,
      },
    });

    // Get recent chats for each bot
    const recentChatsMap = {};
    
    for (const bot of bots) {
      const recentChats = await prisma.chat.findMany({
        where: {
          botId: bot.id,
          userId: session.user.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5, // Limit to 5 most recent chats per bot
        select: {
          id: true,
          title: true,
          updatedAt: true,
        },
      });
      
      recentChatsMap[bot.id] = recentChats;
    }

    res.status(200).json(recentChatsMap);
  } catch (error) {
    console.error("Error fetching recent chats by bot:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
}