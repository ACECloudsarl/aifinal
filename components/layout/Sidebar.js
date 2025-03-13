"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Bot, Plus, Settings, LogOut, Moon, Sun, 
  MessageCircle, ImageIcon, LayoutGrid, History, Sparkles,
  ChevronLeft, ChevronRight, Search, Home, Clock, ArrowUpRight,
  Star, Zap, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export default function Sidebar({ 
  className, 
  chatList = [], 
  currentChat, 
  currentView = "home",
  usageLimit = 15000,
  usageCount = 12500,
  createNewChat,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  
  // Load collapsed state from localStorage
  useEffect(() => {
    const storedState = localStorage.getItem("sidebarCollapsed");
    if (storedState !== null) {
      setCollapsed(JSON.parse(storedState));
    }
  }, []);

  // Save collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  // Calculate usage percentage
  const usagePercentage = Math.min(100, Math.round((usageCount / usageLimit) * 100));
  
  // Get usage status
  const getUsageStatus = () => {
    if (usagePercentage > 90) {
      return { 
        color: "text-red-600 dark:text-red-400",
        bg: "bg-red-600",
        bgLight: "bg-red-100 dark:bg-red-950/30",
        border: "border-red-200 dark:border-red-800"
      };
    } else if (usagePercentage > 70) {
      return { 
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-600",
        bgLight: "bg-amber-100 dark:bg-amber-950/30",
        border: "border-amber-200 dark:border-amber-800"
      };
    } else {
      return { 
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-600",
        bgLight: "bg-emerald-100 dark:bg-emerald-950/30",
        border: "border-emerald-200 dark:border-emerald-800"
      };
    }
  };
  
  const usageStatus = getUsageStatus();

  // Format date for chat items
  const formatDate = (dateString) => {
    if (!dateString) return "Today";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  // Handle create new chat
  const handleCreateNewChat = async () => {
    if (createNewChat) await createNewChat();
  };

  return (
    <>
      <div
        className={cn(
          "group fixed inset-y-0 flex h-full flex-col border-r border-gray-200 bg-white transition-all dark:border-gray-800 dark:bg-gray-950",
          collapsed ? "w-16" : "w-64",
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-14 items-center border-b border-gray-200 px-3 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                AI Chat
              </h1>
            )}
          </Link>
          <div className="flex-1" />
          {!collapsed && (
            <Badge 
              variant="outline" 
              className={`text-xs ${usageStatus.bgLight} ${usageStatus.border} ${usageStatus.color} flex items-center gap-1`}
            >
              <Zap className="h-3 w-3" />
              {usagePercentage}%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <Button 
            onClick={handleCreateNewChat} 
            variant="default" 
            className={cn(
              "w-full justify-start shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0",
              collapsed ? "px-0 justify-center" : "px-4"
            )}
          >
            <Plus className="h-4 w-4" />
            {!collapsed && <span className="ml-2">New Chat</span>}
          </Button>
        </div>

        {/* Navigation Links & Chats */}
        <ScrollArea className="flex-1 px-3 py-2">
          {/* Main Navigation */}
          <div className="space-y-1 pb-2">
            {!collapsed && (
              <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 px-2 pb-1">
                Navigation
              </div>
            )}
            
            <NavLink href="/" icon={Home} label="Home" collapsed={collapsed} active={currentView === "home"} />
            <NavLink href="/c" icon={MessageCircle} label="Chats" collapsed={collapsed} active={currentView === "chat"} />
            <NavLink href="/history" icon={Clock} label="History" collapsed={collapsed} active={currentView === "history"} />
            <NavLink href="/create-image" icon={ImageIcon} label="Create Images" collapsed={collapsed} active={currentView === "create-image"} />
            <NavLink href="/generations" icon={LayoutGrid} label="Image Gallery" collapsed={collapsed} active={currentView === "generations"} />
            <NavLink href="/explore" icon={Search} label="Explore Bots" collapsed={collapsed} active={currentView === "explore"} />
          </div>

          {/* Recent Chats */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1">
              {!collapsed ? (
                <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 px-2">
                  Recent Chats
                </div>
              ) : (
                <div className="w-full flex justify-center">
                  <History className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              
              {!collapsed && chatList.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {chatList.length}
                </Badge>
              )}
            </div>
            
            {chatList.length === 0 ? (
              !collapsed && (
                <div className="text-center py-2 px-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No chats yet</p>
                  <Button 
                    variant="link" 
                    className="text-indigo-600 dark:text-indigo-400 p-0 h-auto text-sm"
                    onClick={handleCreateNewChat}
                  >
                    Start your first chat
                  </Button>
                </div>
              )
            ) : (
              <div className="space-y-1">
                {chatList.map((chat) => (
                  <Link 
                    key={chat._id || chat.id} 
                    href={`/c/${chat._id || chat.id}`}
                    className="block w-full"
                  >
                    <Button
                      variant={currentChat === (chat._id || chat.id) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full text-left",
                        collapsed ? "justify-center" : "justify-start",
                        "h-9"
                      )}
                    >
                      {collapsed ? (
                        <History className="h-4 w-4" />
                      ) : (
                        <div className="flex items-center w-full min-w-0">
                          <History className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                          <div className="truncate flex-1 min-w-0">
                            <div className="truncate text-sm">{chat.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {formatDate(chat.created_at || chat.date)}
                            </div>
                          </div>
                        </div>
                      )}
                    </Button>
                  </Link>
                ))}
                
                {!collapsed && chatList.length > 0 && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-indigo-600 dark:text-indigo-400"
                    asChild
                  >
                    <Link href="/history">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>View All History</span>
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Featured Bots Section */}
          {!collapsed && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 pb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 px-2">
                  Featured Bots
                </div>
                <Badge variant="outline" className="text-xs py-0 h-5 flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                  <Star className="h-3 w-3" />
                  <span>New</span>
                </Badge>
              </div>
              
              <div className="space-y-1">
                <Link href="/explore?category=code" className="block w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <Bot className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Code Wizard</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Coding expert</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                
                <Link href="/explore?category=creative" className="block w-full">
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 hover:bg-purple-50 dark:hover:bg-purple-900/20 group"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-2 group-hover:scale-110 transition-transform">
                      <Bot className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">Creative Muse</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Writing assistant</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
                
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-indigo-600 dark:text-indigo-400"
                  asChild
                >
                  <Link href="/explore">
                    <Sparkles className="h-4 w-4 mr-2" />
                    <span>View All Bots</span>
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="mt-auto p-3 border-t border-gray-200 dark:border-gray-800">
          {collapsed ? (
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-500" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-500" />
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                      <AvatarFallback className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        UC
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <UserDropdownContent />
              </DropdownMenu>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-indigo-400" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-sm">Dark Mode</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 border border-gray-200 dark:border-gray-700">
                        <AvatarFallback className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                          UC
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">User Account</span>
                    </div>
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <UserDropdownContent />
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </>
  );
}

// Navigation Link Component
function NavLink({ href, icon: Icon, label, collapsed, active }) {
  return (
    <Link href={href} className="block w-full">
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full",
          collapsed ? "justify-center px-0" : "justify-start px-3"
        )}
      >
        <Icon className={cn("h-4 w-4", collapsed ? "" : "mr-2")} />
        {!collapsed && <span>{label}</span>}
      </Button>
    </Link>
  );
}

// User Dropdown Content Component
function UserDropdownContent() {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <div className="px-2 py-1.5 text-sm font-medium">User Account</div>
      <div className="px-2 py-1 text-xs text-muted-foreground">user@example.com</div>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <Crown className="mr-2 h-4 w-4 text-amber-500" />
        <span>Upgrade to Pro</span>
      </DropdownMenuItem>
      <DropdownMenuItem>
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem>
        <LogOut className="mr-2 h-4 w-4" />
        <span>Log out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}