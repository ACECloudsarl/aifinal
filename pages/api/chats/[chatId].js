// pages/api/chats/[chatId].js - Fix the inconsistent query result
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { chatId } = req.query;

  if (req.method === "GET") {
    try {
      // First, just fetch the basic chat information without including relations
      const chat = await prisma.chat.findFirst({
        where: {
          id: chatId,
          userId: session.user.id,
        },
      });

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      // Then, if the chat exists, try to fetch the associated bot
      // This is done separately to handle possible null relations
      try {
        const bot = await prisma.bot.findUnique({
          where: {
            id: chat.botId,
          },
        });
        
        // Return the chat with bot data (or null if bot doesn't exist)
        return res.status(200).json({
          ...chat,
          bot: bot || null,
        });
      } catch (botError) {
        console.error("Error fetching bot for chat:", botError);
        // Still return the chat data, just without the bot
        return res.status(200).json({
          ...chat,
          bot: null,
        });
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
