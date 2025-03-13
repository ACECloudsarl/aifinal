// pages/api/admin/voices/index.js
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
  
  // Check admin permissions
  const admin = await isAdmin(session);
  if (!admin) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  // GET - Fetch all voices
  if (req.method === "GET") {
    try {
      const voices = await prisma.voice.findMany({
        orderBy: {
          name: "asc"
        }
      });
      
      return res.status(200).json(voices);
    } catch (error) {
      console.error("Error fetching voices:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  // POST - Create a new voice
  if (req.method === "POST") {
    try {
      const { 
        name, 
        externalId, 
        description, 
        gender, 
        accent, 
        age, 
        previewText, 
        languages, 
        preview, 
        flag, 
        isActive 
      } = req.body;
      
      // Validate required fields
      if (!name || !description) {
        return res.status(400).json({ message: "Name and description are required" });
      }
      
      // Create the voice
      const voice = await prisma.voice.create({
        data: {
          name,
          externalId: externalId || null,
          description,
          gender: gender || null,
          accent: accent || null,
          age: age || null,
          previewText: previewText || null,
          languages: languages || [],
          preview: preview || null,
          flag: flag || null,
          isActive: isActive !== undefined ? isActive : true
        }
      });
      
      return res.status(201).json(voice);
    } catch (error) {
      console.error("Error creating voice:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  return res.status(405).json({ message: "Method not allowed" });
}