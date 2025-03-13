"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bot, Plus, Settings, LogOut, Moon, Sun, CreditCard,
  MessageCircle, ImageIcon, LayoutGrid, History, Sparkles,
  BookOpen, Keyboard, ChevronDown, X, Search, Home, 
  Clock, Star, Crown, Bell, ArrowUpRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetClose
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default function MobileSidebar({ 
  isOpen, 
  setIsOpen, 
  currentChat,
  chatList = [], 
  createNewChat,
  selectedModel,
  setSelectedModel,
  models = [],
  currentView,
  setCurrentView,
  usageLimit = 15000,
  usageCount = 12500
}) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const profile = "x"

  // Featured models with better icons
  const featuredModels = [
    { id: "anthropic/claude-3-opus:beta", name: "Claude 3 Opus", icon: "✨", description: "Most powerful, slow", tier: "premium" },
    { id: "meta-llama/Llama-3-70b-chat-hf", name: "Llama 3 70B", icon: "🦙", description: "High quality, balanced", tier: "professional" },
    { id: "anthropic/claude-3-sonnet:beta", name: "Claude 3 Sonnet", icon: "🎵", description: "Fast, reliable", tier: "professional" },
    { id: "meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo", name: "Llama Vision", icon: "👁️", description: "Image understanding", tier: "premium" },
    { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", icon: "🌪️", description: "Efficient, fast", tier: "standard" }
  ];

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

  // Helper functions
  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
    setIsOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Today";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };

  const handleCreateNewChat = async () => {
    const newChat = await createNewChat();
    if (newChat) {
      router.push(`/c/${newChat.id || newChat._id}`);
      setIsOpen(false);
    }
  };

  const handleNavigation = (path, view) => {
    router.push(path);
    if (setCurrentView) setCurrentView(view);
    setIsOpen(false);
  };

  // Get model tier badge
  const getModelTierBadge = (model) => {
    if (!model.tier) return null;
    
    const tierStyles = {
      premium: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      professional: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
      standard: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700"
    };
    
    const style = tierStyles[model.tier] || tierStyles.standard;
    
    return (
      <Badge 
        variant="outline" 
        className={`capitalize text-xs py-0 h-5 ${style}`}
      >
        {model.tier.charAt(0).toUpperCase() + model.tier.slice(1)}
      </Badge>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col border-r-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shadow-sm">
              <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">AI Chat</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${usageStatus.bgLight} ${usageStatus.border} ${usageStatus.color} flex items-center gap-1`}
            >
              <Zap className="h-3 w-3" />
              {usagePercentage}%
            </Badge>
            
            <SheetClose className="rounded-full h-6 w-6 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="h-4 w-4" />
            </SheetClose>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleCreateNewChat} 
              variant="default" 
              className="flex-1 justify-start gap-2 shadow-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 border-0"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="px-3 justify-center shadow-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
              onClick={() => handleNavigation('/create-image', 'create-image')}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Section */}
          <div className="px-3 py-2 space-y-1">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium px-2">
                Navigation
              </h2>
            </div>
            
            {/* Welcome/Home page */}
            <Button
              variant={currentView === "home" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation("/", "home")}
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Welcome</span>
            </Button>
            
            {/* Chats */}
            <Button
              variant={currentView === "chat" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation(chatList.length > 0 ? `/c/${chatList[0]?.id || chatList[0]?._id}` : "/", "chat")}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              <span>Chats</span>
            </Button>
            
            {/* History page */}
            <Button
              variant={currentView === "history" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation("/history", "history")}
            >
              <Clock className="h-4 w-4 mr-2" />
              <span>History</span>
            </Button>
            
            {/* Create Images */}
            <Button
              variant={currentView === "create-image" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation("/create-image", "create-image")}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              <span>Create Images</span>
            </Button>
            
            {/* Image Gallery */}
            <Button
              variant={currentView === "generations" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation("/generations", "generations")}
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              <span>Image Gallery</span>
            </Button>
            
            {/* Explore Bots */}
            <Button
              variant={currentView === "explore" ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => handleNavigation("/explore", "explore")}
            >
              <Search className="h-4 w-4 mr-2" />
              <span>Explore Bots</span>
            </Button>
          </div>
          
          {/* Recent Chats */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium px-2">
                Recent Chats
              </h2>
              {chatList.length > 0 && (
                <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer" variant="secondary">
                  {chatList.length}
                </Badge>
              )}
            </div>
            
            {chatList.length === 0 ? (
              <div className="text-center py-3 px-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">No chats yet</p>
                <Button 
                  variant="link" 
                  className="text-indigo-600 dark:text-indigo-400 p-0 h-auto text-sm"
                  onClick={handleCreateNewChat}
                >
                  Start your first chat
                </Button>
              </div>
            ) : (
              chatList.map((chat) => (
                <Link 
                  key={chat._id || chat.id} 
                  href={`/c/${chat._id || chat.id}`}
                  className="block w-full"
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={currentChat === (chat._id || chat.id) ? "secondary" : "ghost"}
                    className="w-full justify-start text-left font-normal h-auto py-2"
                  >
                    <div className="flex items-center w-full min-w-0">
                      <History className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
                      <div className="truncate flex-1 min-w-0">
                        <div className="truncate text-sm">{chat.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(chat.created_at || chat.date)}
                        </div>
                      </div>
                    </div>
                  </Button>
                </Link>
              ))
            )}
            
            {chatList.length > 0 && (
              <Button
                variant="ghost"
                className="w-full justify-start mt-1 text-indigo-600 dark:text-indigo-400"
                onClick={() => handleNavigation("/history", "history")}
              >
                <Clock className="h-4 w-4 mr-2" />
                <span>View All History</span>
              </Button>
            )}
          </div>

          {/* Featured Bots */}
          <div className="px-3 py-2 space-y-1.5 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium px-2">
                Featured Bots
              </h2>
              <Badge variant="outline" className="text-xs py-0 h-5 flex items-center gap-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                <Star className="h-3 w-3" />
                <span>New</span>
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              className="w-full justify-start h-10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 group"
              onClick={() => handleNavigation('/explore?category=code', 'explore')}
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
            
            <Button
              variant="ghost"
              className="w-full justify-start h-10 hover:bg-purple-50 dark:hover:bg-purple-900/20 group"
              onClick={() => handleNavigation('/explore?category=creative', 'explore')}
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
            
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-indigo-600 dark:text-indigo-400"
              onClick={() => handleNavigation('/explore', 'explore')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <span>View All Bots</span>
            </Button>
          </div>
          
          {/* AI Models */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-800">
            <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium px-2 mb-2">
              AI Models
            </h2>
            {featuredModels.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "secondary" : "ghost"}
                className="w-full justify-start h-9 px-2 text-sm"
                onClick={() => {
                  if (setSelectedModel) setSelectedModel(model.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center w-full">
                  <span className="text-lg mr-2">{model.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{model.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{model.description}</div>
                  </div>
                  {getModelTierBadge(model)}
                </div>
              </Button>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-9 px-2 text-sm">
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    More Models
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 border-gray-200 dark:border-gray-800">
                {models && models
                  .filter(model => !featuredModels.some(fm => fm.id === model.id))
                  .map((model) => (
                    <DropdownMenuItem 
                      key={model.id}
                      onClick={() => {
                        if (setSelectedModel) setSelectedModel(model.id);
                        setIsOpen(false);
                      }}
                    >
                      {model.name}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {theme === "dark" ? (
                <Moon className="h-4 w-4 text-indigo-400" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
              <span className="text-sm">Dark Mode</span>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{profile?.full_name || "User Account"}</span>
                </div>
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-gray-200 dark:border-gray-800">
              <div className="px-2 py-1.5 text-sm font-medium">{profile?.full_name || "User Account"}</div>
              <div className="px-2 py-1 text-xs text-muted-foreground">{profile?.email || "user@example.com"}</div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span>Upgrade to Pro</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Documentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400">
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SheetContent>
    </Sheet>
  );
}