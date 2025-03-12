// pages/api/bots/[botId].js - Better error handling
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { botId } = req.query;

  if (req.method === "GET") {
    try {
      // Validate botId format first (if it's MongoDB ObjectId)
      if (!/^[0-9a-fA-F]{24}$/.test(botId)) {
        return res.status(400).json({ message: "Invalid bot ID format" });
      }

      const bot = await prisma.bot.findUnique({
        where: {
          id: botId,
        },
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

  return res.status(405).json({ message: "Method not allowed" });
}
