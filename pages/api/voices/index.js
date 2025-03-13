// pages/api/voices/index.js
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
      // Fetch only active voices for regular users
      const voices = await prisma.voice.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          name: "asc"
        }
      });
      
      return res.status(200).json(voices);
    } catch (error) {
      console.error("Error fetching voices:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}