// pages/api/admin/voices/[voiceId].js
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
  
  const { voiceId } = req.query;
  
  // GET - Fetch a single voice
  if (req.method === "GET") {
    try {
      const voice = await prisma.voice.findUnique({
        where: { id: voiceId }
      });
      
      if (!voice) {
        return res.status(404).json({ message: "Voice not found" });
      }
      
      return res.status(200).json(voice);
    } catch (error) {
      console.error("Error fetching voice:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  // PUT - Update a voice
  if (req.method === "PUT") {
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
      
      // Update the voice
      const updatedVoice = await prisma.voice.update({
        where: { id: voiceId },
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
          isActive: isActive !== undefined ? isActive : true,
          updatedAt: new Date()
        }
      });
      
      return res.status(200).json(updatedVoice);
    } catch (error) {
      console.error("Error updating voice:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  // DELETE - Delete a voice
  if (req.method === "DELETE") {
    try {
      // Check if any bots or user settings depend on this voice
      const voiceUsage = await prisma.$transaction([
        prisma.bot.count({ where: { voiceId } }),
        prisma.userVoiceSettings.count({ where: { preferredVoiceId: voiceId } })
      ]);
      
      const [botCount, userSettingsCount] = voiceUsage;
      
      if (botCount > 0 || userSettingsCount > 0) {
        const details = [];
        if (botCount > 0) details.push(`${botCount} bots`);
        if (userSettingsCount > 0) details.push(`${userSettingsCount} user settings`);
        
        return res.status(400).json({ 
          message: `Cannot delete voice that is in use by ${details.join(' and ')}.`,
          usedBy: { bots: botCount, userSettings: userSettingsCount }
        });
      }
      
      // Delete the voice
      await prisma.voice.delete({
        where: { id: voiceId }
      });
      
      return res.status(200).json({ message: "Voice deleted successfully" });
    } catch (error) {
      console.error("Error deleting voice:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  return res.status(405).json({ message: "Method not allowed" });
}