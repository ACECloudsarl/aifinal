// pages/api/chats/[chatId]/stream.js
import { createTogetherAIClient } from "../../../../lib/togetherAI";
import prisma from "../../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../lib/auth";

// Use Edge runtime for streaming support
export const config = {
  runtime: "edge",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // We can't use getServerSession in Edge, so we'll extract session from a custom header
    // In a real app, you'd want a more secure approach
    const sessionToken = req.headers.get("x-auth-token");
    
    if (!sessionToken) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Parse the request body
    const { chatId, content, messageId } = await req.json();
    
    // Validate required fields
    if (!chatId || !content) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Find the session (simplified for example, would need more robust implementation)
    const session = await prisma.session.findUnique({
      where: {
        sessionToken,
      },
      include: {
        user: true,
      },
    });
    
    if (!session) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Find the chat
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        userId: session.user.id,
      },
      include: {
        bot: true,
      },
    });
    
    if (!chat) {
      return new Response(JSON.stringify({ message: "Chat not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    
    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: "user",
        chatId,
      },
    });
    
    // Get last 10 messages for context
    const previousMessages = await prisma.message.findMany({
      where: {
        chatId,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 10,
    });
    
    // Format messages for Together AI
    const formattedMessages = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Add user's full name to the context
    const userInfo = `The user's name is ${session.user.name}.`;
    
    // If it's a new chat, add a system message with user info and bot's prompt
    if (previousMessages.length <= 1) {
      // Add image generation capability to the system prompt
      const imageGenPrompt = `
You can generate images for the user when they ask for it.
To generate an image, you should use the generate_image function when a user asks for an image.
Only use the function when the user explicitly asks for an image.
`;
      
      formattedMessages.unshift({
        role: "system",
        content: chat.bot.prompt + "\n\n" + imageGenPrompt + "\n\n" + userInfo,
      });
    } else {
      // For existing chats, add the user info to the newest message
      formattedMessages.push({
        role: "user",
        content: content + `\n\n${userInfo} (Note: This is just a reminder of who I am, please don't reference this directly in your response)`,
      });
    }
    
    // Set up image generation tool
    const tools = [
      {
        type: "function",
        function: {
          name: "generate_image",
          description: "Generate an image based on a text description",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "A detailed description of the image to generate",
              },
              style: {
                type: "string",
                enum: ["photographic", "digital-art", "cartoon", "anime", "painting"],
                description: "The style of the image to generate",
              },
            },
            required: ["prompt"],
          },
        },
      },
    ];
    
    // Create a new Together AI client
    const client = createTogetherAIClient();
    
    // Create a streaming response
    const stream = await client.chat.completions.create({
      messages: formattedMessages,
      model: chat.bot.model || "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.7,
      stream: true,
      tools,
      tool_choice: "auto",
    });
    
    // Create a text encoder for the stream
    const encoder = new TextEncoder();
    
    // Create a readable stream
    const readableStream = new ReadableStream({
      async start(controller) {
        let fullContent = "";
        let toolCalls = [];
        
        try {
          for await (const chunk of stream) {
            // Handle tool calls
            if (chunk.choices[0]?.delta?.tool_calls) {
              const toolCall = chunk.choices[0].delta.tool_calls[0];
              
              // Initialize the tool call if needed
              if (!toolCalls[0] || !toolCalls[0].function) {
                toolCalls[0] = {
                  function: { name: "", arguments: "" },
                };
              }
              
              // Update the tool call with the chunk data
              if (toolCall.function?.name) {
                toolCalls[0].function.name = toolCall.function.name;
              }
              
              if (toolCall.function?.arguments) {
                toolCalls[0].function.arguments += toolCall.function.arguments;
              }
              
              // Send a chunk for the frontend to know a tool call is happening
              controller.enqueue(encoder.encode(JSON.stringify({
                type: "tool_call_chunk",
                data: toolCall,
              }) + "\n"));
            }
            
            // Handle content chunks
            if (chunk.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              fullContent += content;
              
              controller.enqueue(encoder.encode(JSON.stringify({
                type: "content",
                data: content,
              }) + "\n"));
            }
            
            // Check if this is the last chunk
            if (chunk.choices[0]?.finish_reason) {
              // If we have tool calls to execute
              if (toolCalls.length > 0 && toolCalls[0].function?.name === "generate_image") {
                try {
                  // Parse the arguments
                  const args = JSON.parse(toolCalls[0].function.arguments);
                  
                  // Generate the image
                  const imageUrl = await generateImage(args.prompt, args.style || "photographic");
                  
                  // Send the image URL to the frontend
                  controller.enqueue(encoder.encode(JSON.stringify({
                    type: "tool_result",
                    data: {
                      name: "generate_image",
                      result: { url: imageUrl },
                    },
                  }) + "\n"));
                  
                  // Store the image in the database
                  await storeImageInMessage(chatId, fullContent, imageUrl, session.user.id);
                } catch (error) {
                  console.error("Error executing tool:", error);
                  controller.enqueue(encoder.encode(JSON.stringify({
                    type: "error",
                    data: "Failed to generate image",
                  }) + "\n"));
                }
              } else {
                // Store the final message
                await storeMessage(chatId, fullContent, session.user.id);
              }
              
              // Signal the end of the stream
              controller.enqueue(encoder.encode(JSON.stringify({
                type: "done",
              }) + "\n"));
            }
          }
        } catch (error) {
          console.error("Streaming error:", error);
          controller.enqueue(encoder.encode(JSON.stringify({
            type: "error",
            data: "Stream error occurred",
          }) + "\n"));
        } finally {
          controller.close();
        }
      },
    });
    
    // Return the stream
    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream handler error:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Function to store a message in the database
async function storeMessage(chatId, content, userId) {
    try {
      // Create assistant message
      await prisma.message.create({
        data: {
          content,
          role: "assistant",
          chatId,
          tokens: content.length / 4, // Rough estimate
        },
      });
      
      // Update the chat title if needed
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { title: true },
      });
      
      if (chat?.title === "New Chat") {
        // Get the first user message
        const firstUserMessage = await prisma.message.findFirst({
          where: {
            chatId,
            role: "user",
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            content: true
          }
        });
        
        // Only proceed if we have a valid message with content
        if (firstUserMessage && firstUserMessage.content) {
          // Generate a title based on the first user message
          const suggestedTitle = firstUserMessage.content.substring(0, 30) + 
            (firstUserMessage.content.length > 30 ? "..." : "");
          
          await prisma.chat.update({
            where: { id: chatId },
            data: { title: suggestedTitle },
          });
        } else {
          // Fallback title if no user message is found
          await prisma.chat.update({
            where: { id: chatId },
            data: { title: "Conversation" },
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error storing message:", error);
      return false;
    }
  }


// Function to store an image in the message
async function storeImageInMessage(chatId, content, imageUrl, userId) {
    try {
      // Create assistant message with image
      await prisma.message.create({
        data: {
          content: `${content}\n\n![Generated Image](${imageUrl})`,
          role: "assistant",
          chatId,
          tokens: content.length / 4, // Rough estimate
          metadata: {
            imageUrl,
          },
        },
      });
      
      return true;
    } catch (error) {
      console.error("Error storing image message:", error);
      return false;
    }
  }
  
  // Function to generate an image using flux-schnell
 // Generate image using Together AI's FLUX.1-schnell model
async function generateImage(prompt, style = "photographic") {
    const together = new Together({
      apiKey: process.env.TOGETHER_API_KEY,
    });
    
    // Apply style modifiers to the prompt
    let stylePrompt = getStyledPrompt(prompt, style);
    
    // Generate the image
    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: stylePrompt,
      width: 1024,
      height: 1024,
      steps: 4,     // Can be 1-4 for Free tier
      n: 1,
      response_format: "b64_json"
    });
    
    // Get the base64 encoded image
    const imageB64 = response.data[0].b64_json;
    
    // Convert to a usable format (data URL or stored file)
    return `data:image/png;base64,${imageB64}`;
  }
