// pages/api/transcribe.js - Fully optimized with multiparty
import multiparty from 'multiparty';
import fs from 'fs';
import util from 'util';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log("Received transcription request");
    
    // Parse form using multiparty
    const form = new multiparty.Form({
      maxFieldsSize: 10 * 1024 * 1024, // 10MB max file size
    });
    
    // Parse the request
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error("Form parsing error:", err);
          return reject(err);
        }
        console.log("Parsed fields:", fields);
        console.log("Parsed files:", Object.keys(files));
        resolve([fields, files]);
      });
    });
    
    // Get the audio file
    if (!files.audio || files.audio.length === 0) {
      console.error("No audio file found in request");
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    const audioFile = files.audio[0];
    console.log(`Audio file received: ${audioFile.originalFilename}, size: ${audioFile.size} bytes, path: ${audioFile.path}`);
    
    // Check file size
    if (audioFile.size < 100) {
      console.error("Audio file too small:", audioFile.size);
      return res.status(400).json({ error: 'Audio file too small' });
    }
    
    // Read the file
    const fileBuffer = fs.readFileSync(audioFile.path);
    console.log(`Read file buffer, size: ${fileBuffer.length} bytes`);
    
    // Determine content type from file name
    let contentType = 'audio/webm';
    if (audioFile.originalFilename) {
      const ext = audioFile.originalFilename.split('.').pop().toLowerCase();
      if (ext === 'mp3') contentType = 'audio/mpeg';
      else if (ext === 'mp4') contentType = 'audio/mp4';
      else if (ext === 'wav') contentType = 'audio/wav';
      else if (ext === 'ogg') contentType = 'audio/ogg';
    }
    
    console.log(`Using content type: ${contentType}`);
    
    // Validate OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not set");
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }
    
    // Prepare FormData for OpenAI API
    const openaiFormData = new FormData();
    const blob = new Blob([fileBuffer], { type: contentType });
    openaiFormData.append('file', blob, audioFile.originalFilename || 'audio.webm');
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', fields.language?.[0] || 'en');
    
    console.log("Sending request to OpenAI API");
    
    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });
    
    // Clean up the temporary file
    fs.unlinkSync(audioFile.path);
    
    // Handle OpenAI response
    if (!openaiResponse.ok) {
      console.error("OpenAI API error status:", openaiResponse.status);
      let errorMessage = 'Error from OpenAI API';
      
      try {
        const errorData = await openaiResponse.json();
        console.error('OpenAI API error details:', errorData);
        errorMessage = errorData.error?.message || errorData.error || errorMessage;
      } catch (parseError) {
        console.error("Could not parse OpenAI error response");
      }
      
      return res.status(openaiResponse.status).json({ 
        error: errorMessage
      });
    }
    
    const data = await openaiResponse.json();
    console.log("Transcription successful:", data);
    
    return res.status(200).json({ transcript: data.text });
    
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ 
      error: 'Failed to transcribe audio',
      message: error.message
    });
  }
}