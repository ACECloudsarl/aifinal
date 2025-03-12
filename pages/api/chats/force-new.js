// pages/api/chats/force-new.js

import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { botId, title } = req.body;

    if (!botId) {
      return res.status(400).json({ message: "Bot ID is required" });
    }

    // Create a new chat entry - guaranteed to be new with a unique ID
    const chat = await prisma.chat.create({
      data: {
        title: title || `New Chat (${new Date().toLocaleTimeString()})`,
        userId: session.user.id,
        botId: botId,
      },
    });

    // Return the newly created chat 
    return res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating new chat:", error);
    return res.status(500).json({ 
      message: "Failed to create new chat",
      error: error.message
    });
  }
}