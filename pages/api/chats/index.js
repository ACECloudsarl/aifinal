// pages/api/chats/index.js - Double-check this implementation

import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const chats = await prisma.chat.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          bot: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      return res.status(200).json(chats);
    } catch (error) {
      console.error("Error fetching chats:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  if (req.method === "POST") {
    try {
      const { botId, title } = req.body;
      
      if (!botId) {
        return res.status(400).json({ message: "Bot ID is required" });
      }

      // Create a new chat regardless of whether existing chats exist
      const chat = await prisma.chat.create({
        data: {
          title: title || "New Chat",
          userId: session.user.id,
          botId,
        },
      });

      return res.status(201).json(chat);
    } catch (error) {
      console.error("Error creating chat:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}