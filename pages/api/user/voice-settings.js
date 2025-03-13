// pages/api/user/voice-settings.js
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const userId = session.user.id;

  // GET - Fetch user's voice settings
  if (req.method === "GET") {
    try {
      // Fetch voice settings
      const userVoiceSettings = await prisma.userVoiceSettings.findUnique({
        where: {
          userId: userId,
        },
        include: {
          preferredVoice: true,
        }
      });

      // If no settings exist yet, return defaults
      if (!userVoiceSettings) {
        return res.status(200).json({
          autoTTS: false,
          preferredVoiceId: null,
          speakingRate: 1.0,
          speakingPitch: 1.0,
          inputDetectLanguage: true,
          preferredLanguage: "en",
        });
      }

      return res.status(200).json(userVoiceSettings);
    } catch (error) {
      console.error("Error fetching voice settings:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  // POST - Create or update voice settings
  if (req.method === "POST") {
    try {
      const {
        autoTTS,
        preferredVoiceId,
        speakingRate,
        speakingPitch,
        inputDetectLanguage,
        preferredLanguage,
      } = req.body;

      // Validate settings
      if (speakingRate !== undefined && (speakingRate < 0.5 || speakingRate > 2.0)) {
        return res.status(400).json({ message: "Speaking rate must be between 0.5 and 2.0" });
      }

      if (speakingPitch !== undefined && (speakingPitch < 0.5 || speakingPitch > 2.0)) {
        return res.status(400).json({ message: "Speaking pitch must be between 0.5 and 2.0" });
      }

      // Build update data
      const updateData = {};
      
      if (autoTTS !== undefined) updateData.autoTTS = autoTTS;
      if (preferredVoiceId !== undefined) updateData.preferredVoiceId = preferredVoiceId;
      if (speakingRate !== undefined) updateData.speakingRate = speakingRate;
      if (speakingPitch !== undefined) updateData.speakingPitch = speakingPitch;
      if (inputDetectLanguage !== undefined) updateData.inputDetectLanguage = inputDetectLanguage;
      if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage;

      // Create or update voice settings using upsert
      const settings = await prisma.userVoiceSettings.upsert({
        where: {
          userId: userId,
        },
        update: {
          ...updateData,
          updatedAt: new Date(),
        },
        create: {
          userId: userId,
          autoTTS: autoTTS !== undefined ? autoTTS : false,
          preferredVoiceId: preferredVoiceId || null,
          speakingRate: speakingRate !== undefined ? speakingRate : 1.0,
          speakingPitch: speakingPitch !== undefined ? speakingPitch : 1.0,
          inputDetectLanguage: inputDetectLanguage !== undefined ? inputDetectLanguage : true,
          preferredLanguage: preferredLanguage || "en",
        },
        include: {
          preferredVoice: true,
        }
      });

      return res.status(200).json(settings);
    } catch (error) {
      console.error("Error updating voice settings:", error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}