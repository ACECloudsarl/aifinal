// pages/api/admin/voices/seed.js
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";
import { ElevenLabsClient } from "elevenlabs";

// Default voices data
const DEFAULT_VOICES = [
  { 
    externalId: "IES4nrmZdUBHByLBde0P", 
    name: "Haytham", 
    description: "Arabic-fluent male voice", 
    previewText: "مرحبا بكم في خدمة تحويل النص إلى كلام عالية الجودة.",
    languages: ["ar", "en"],
    gender: "Male",
    accent: "Middle Eastern",
    age: "Adult",
    flag: "🇦🇪" 
  },
  { 
    externalId: "mRdG9GYEjJmIzqbYTidv", 
    name: "Sana", 
    description: "Mature Arabic-fluent male voice", 
    previewText: "أهلاً بكم في عالم الذكاء الاصطناعي.",
    languages: ["ar", "en"],
    gender: "Male",
    accent: "Middle Eastern",
    age: "Adult",
    flag: "🇦🇪" 
  },
  { 
    externalId: "tnSpp4vdxKPjI9w0GnoV", 
    name: "Hope", 
    description: "Young Arabic-fluent male voice", 
    previewText: "يمكنك استخدام هذه الخدمة لأي نص باللغة العربية.",
    languages: ["ar", "en", "de"],
    gender: "Female",
    accent: "Middle Eastern",
    age: "Young Adult",
    flag: "🇦🇪" 
  },
  { 
    externalId: "tTZ0TVc9Q1bbWngiduLK", 
    name: "Rudra", 
    description: "Young Arabic-fluent male voice", 
    previewText: "يمكنك استخدام هذه الخدمة لأي نص باللغة العربية.",
    languages: ["ar", "en"],
    gender: "Male",
    accent: "Middle Eastern",
    age: "Young Adult",
    flag: "🇦🇪" 
  },
  { 
    externalId: "oWAxZDx7w5VEj9dCyTzz", 
    name: "Grace", 
    description: "Professional female voice", 
    previewText: "Hello, I'm Grace. I can read any text in a natural sounding voice.",
    languages: ["en", "fr", "de", "it", "es", "pt", "pl"],
    gender: "Female",
    accent: "American",
    age: "Adult",
    flag: "🇬🇧" 
  },
  { 
    externalId: "flq6f7yk4E4fJM5XTYuZ", 
    name: "Liam", 
    description: "Versatile male voice", 
    previewText: "Hi there! I'm Liam, and I can help narrate your content with clarity.",
    languages: ["en", "fr", "de", "it", "es", "pt"],
    gender: "Male",
    accent: "British",
    age: "Adult",
    flag: "🇬🇧" 
  },
  { 
    externalId: "ErXwobaYiN019PkySvjV", 
    name: "Antoni", 
    description: "Friendly male voice", 
    previewText: "Hello! I'm Antoni, ready to bring your text to life.",
    languages: ["en", "pl"],
    gender: "Male",
    accent: "Polish",
    age: "Adult",
    flag: "🇵🇱" 
  },
  {  
    externalId: "pFZP5JQG7L8oEV9hJ0gQ", 
    name: "Matteo", 
    description: "Expressive Italian male voice", 
    previewText: "Ciao! Sono Matteo e posso leggere qualsiasi testo con un tono naturale.",
    languages: ["it", "en"],
    gender: "Male",
    accent: "Italian",
    age: "Adult",
    flag: "🇮🇹" 
  },
  { 
    externalId: "80P6xAUlZFTzLJFuNmup", 
    name: "Adrian", 
    description: "Professional Romanian male voice", 
    previewText: "Bună ziua! Sunt Adrian și vă pot ajuta să prezentați conținutul dvs.",
    languages: ["ro", "en"],
    gender: "Male",
    accent: "Romanian",
    age: "Adult",
    flag: "🇷🇴" 
  }
];

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
  
  // Only allow POST for seeding
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  try {
    const { fetchFromElevenLabs } = req.body;
    let voicesToSeed = DEFAULT_VOICES;
    
    // Fetch voices from ElevenLabs if requested
    if (fetchFromElevenLabs && process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
      try {
        const client = new ElevenLabsClient({
          apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
        });
        
        const elevenLabsVoices = await client.voices.getAll();
        
        // Map ElevenLabs voices to our format
        if (elevenLabsVoices && elevenLabsVoices.length > 0) {
          voicesToSeed = elevenLabsVoices.map(voice => ({
            externalId: voice.voice_id,
            name: voice.name,
            description: voice.description || `${voice.name} voice from ElevenLabs`,
            previewText: "Hello, this is a preview of my voice from ElevenLabs.",
            languages: ['en'], // Default to English as ElevenLabs doesn't provide language info
            gender: voice.labels?.gender || null,
            accent: voice.labels?.accent || null,
            age: voice.labels?.age || null,
            flag: '🌐', // Default global flag
            isActive: true
          }));
        }
      } catch (elevenLabsError) {
        console.error("Error fetching from ElevenLabs:", elevenLabsError);
        // Continue with default voices if ElevenLabs fetch fails
      }
    }
    
    // Prepare results
    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      voices: []
    };
    
    // Process each voice
    for (const voiceData of voicesToSeed) {
      // Check if voice with this external ID already exists
      const existingVoice = voiceData.externalId ? 
        await prisma.voice.findFirst({
          where: { externalId: voiceData.externalId }
        }) : null;
      
      if (existingVoice) {
        // Update existing voice
        const updatedVoice = await prisma.voice.update({
          where: { id: existingVoice.id },
          data: {
            name: voiceData.name,
            description: voiceData.description,
            previewText: voiceData.previewText,
            languages: voiceData.languages,
            gender: voiceData.gender,
            accent: voiceData.accent,
            age: voiceData.age,
            flag: voiceData.flag,
            updatedAt: new Date()
          }
        });
        
        results.updated++;
        results.voices.push(updatedVoice);
      } else {
        // Check if a voice with the same name exists
        const voiceWithSameName = await prisma.voice.findFirst({
          where: { name: voiceData.name }
        });
        
        if (voiceWithSameName) {
          results.skipped++;
          continue;
        }
        
        // Create new voice
        const newVoice = await prisma.voice.create({
          data: voiceData
        });
        
        results.created++;
        results.voices.push(newVoice);
      }
    }
    
    return res.status(200).json({ 
      message: `Successfully seeded voices: ${results.created} created, ${results.updated} updated, ${results.skipped} skipped.`,
      results
    });
  } catch (error) {
    console.error("Error seeding voices:", error);
    return res.status(500).json({ message: "Error seeding voices", error: error.message });
  }
}