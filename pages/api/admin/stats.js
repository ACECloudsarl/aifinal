// pages/api/admin/stats.js
import prisma from "../../../lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";

export default async function handler(req, res) {
  // Check authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Check admin permissions (to be implemented with user roles)
  // const admin = await isAdmin(session);
  // if (!admin) {
  //   return res.status(403).json({ message: "Forbidden: Admin access required" });
  // }
  
  if (req.method === "GET") {
    try {
      // Get total users
      const totalUsers = await prisma.user.count();
      
      // Get total bots
      const totalBots = await prisma.bot.count();
      
      // Get total chats
      const totalChats = await prisma.chat.count();
      
      // Get active users today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const activeUsers = await prisma.session.count({
        where: {
          expires: {
            gte: today
          }
        },
        distinct: ['userId']
      });
      
      // Get recently added bots
      const recentBots = await prisma.bot.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      });
      
      // Get top used bots (this is a more complex query and might require optimization)
      const topBots = await prisma.bot.findMany({
        take: 5,
        include: {
          _count: {
            select: {
              chats: true
            }
          },
          chats: {
            select: {
              _count: {
                select: {
                  messages: true
                }
              }
            }
          }
        },
        orderBy: {
          chats: {
            _count: 'desc'
          }
        }
      });
      
      // Format top bots data
      const formattedTopBots = topBots.map(bot => ({
        id: bot.id,
        name: bot.name,
        avatar: bot.avatar,
        chatCount: bot._count.chats,
        messageCount: bot.chats.reduce((sum, chat) => sum + chat._count.messages, 0)
      }));
      
      return res.status(200).json({
        stats: {
          totalUsers,
          totalBots,
          totalChats,
          activeUsers
        },
        recentBots,
        topBots: formattedTopBots
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
  }
  
  return res.status(405).json({ message: "Method not allowed" });
}