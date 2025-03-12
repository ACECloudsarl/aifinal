// pages/api/upload/r2.js - FIXED VERSION
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Helper function to get file extension from content type
function getFileExtension(contentType) {
  const types = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  
  return types[contentType] || 'png';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Authenticate user
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = session.user.id;
  
  // Debug environment variables - important!
  console.log('R2 Configuration Debug:');
  console.log('R2_ENDPOINT:', process.env.R2_ENDPOINT ? 'Set (value hidden)' : 'Not set');
  console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'Set (value hidden)' : 'Not set');
  console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? 'Set (value hidden)' : 'Not set');
  console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);
  console.log('NEXT_PUBLIC_R2_PUBLIC_URL:', process.env.NEXT_PUBLIC_R2_PUBLIC_URL);
  
  // Validate bucket name
  if (!process.env.R2_BUCKET_NAME) {
    return res.status(500).json({ error: 'R2_BUCKET_NAME environment variable is required' });
  }
  

  // Initialize S3 client for R2
const client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});


  
  try {
    const { 
      base64Data, 
      contentType = 'image/png', 
      isGenerated = true, 
      prompt = 'AI Generated Image', 
      chatId,
      messageId,
      model 
    } = req.body;
    
    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    // Remove base64 prefix if present
    const base64WithoutPrefix = base64Data.replace(/^data:image\/\w+;base64,/, '');
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64WithoutPrefix, 'base64');
    
    // Generate a unique filename
    const fileExtension = getFileExtension(contentType);
    const type = isGenerated ? 'generated' : 'uploaded';
    const filename = `aistorage/${type}/${uuidv4()}.${fileExtension}`;
    
    // Log what we're about to do
    console.log(`Uploading file to R2 bucket: ${process.env.R2_BUCKET_NAME}`);
    console.log(`File path: ${filename}`);
    
    // Upload to R2
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    };
    
    console.log('Upload parameters:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType,
      BodySize: buffer.length,
    });
    
    const command = new PutObjectCommand(uploadParams);
    
    const uploadResult = await client.send(command);
    console.log('R2 upload result:', uploadResult);
    
    // Create the public URL using the R2 public endpoint
    const fileUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/aistorage/${filename}`;
    console.log('File uploaded successfully to R2:', fileUrl);
    
    // Save to the database with prisma if needed
    let generationInfo = null;
    if (messageId && chatId) {
      generationInfo = {
        url: fileUrl,
        prompt,
        chatId,
        messageId
      }; 
    }
    
    return res.status(200).json({
      url: fileUrl,
      success: true,
      generationInfo
    });
  } catch (error) {
    console.error('R2 upload error:', error);
    return res.status(500).json({ error: `Failed to upload file: ${error.message}` });
  }
}