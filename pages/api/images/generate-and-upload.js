// pages/api/images/generate-and-upload.js - SIMPLIFIED VERSION
import { generateImage } from "../../../lib/togetherAI";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client for R2
const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    
    console.log(`Generating image for prompt: ${prompt.substring(0, 30)}...`);
    
    // Step 1: Generate the image using TogetherAI
    const base64Data = await generateImage(prompt);
    
    if (!base64Data) {
      return res.status(500).json({ message: "Failed to generate image" });
    }
    
    console.log(`Image generated successfully, now uploading to R2...`);
    
    // Step 2: Upload the image to R2
    // Generate a unique filename
    const filename = `generated/${uuidv4()}.png`;
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to R2
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: 'image/png',
    };
    
    await client.send(new PutObjectCommand(uploadParams));
    
    // Create the public URL
    let imageUrl;
    if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL.endsWith('/')) {
      imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}${filename}`;
    } else {
      imageUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${filename}`;
    }
    
    console.log(`Image uploaded to R2: ${imageUrl}`);
    
    // Return the image URL - no database updates here!
    return res.status(200).json({ 
      success: true, 
      url: imageUrl
    });
  } catch (error) {
    console.error("Error in generate-and-upload process:", error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to process image request"
    });
  }
}