"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { 
  Search,
  Bot, 
  MessageSquare, 
  Code, 
  Star, 
  ThumbsUp, 
  Filter,
  Laugh,
  HeartHandshake,
  Brain,
  Palette,
  Sparkles,
  Zap,
  Play,
  X,
  Calculator,
  ChevronRight,
  ArrowRight,
  Menu
} from "lucide-react";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// Bot categories with icons
const BOT_CATEGORIES = [
  { id: "all", name: "All Bots", icon: <Bot className="h-4 w-4" /> },
  { id: "dev", name: "Development", icon: <Code className="h-4 w-4" /> },
  { id: "chat", name: "Conversation", icon: <MessageSquare className="h-4 w-4" /> },
  { id: "creative", name: "Creative", icon: <Palette className="h-4 w-4" /> },
  { id: "fun", name: "Fun & Games", icon: <Laugh className="h-4 w-4" /> },
  { id: "productivity", name: "Productivity", icon: <Zap className="h-4 w-4" /> },
  { id: "math", name: "Math & Science", icon: <Calculator className="h-4 w-4" /> },
  { id: "featured", name: "Featured", icon: <Star className="h-4 w-4" /> },
];

// Mock API call for sample bots
const fetchBots = async (category = 'all') => {
  // This would be a real API call in production
  return [
    {
      botId: "1",
      name: "Code Wizard",
      description: "Expert coding assistant that helps with programming in multiple languages",
      icon: "👨‍💻",
      color: "blue",
      rating: 4.9,
      categories: ["dev", "productivity"],
      examples: [
        "Help me debug this React component",
        "Explain async/await in JavaScript",
        "Write a Python function to sort a list of dictionaries"
      ],
      usageCount: 12450,
      modelId: "anthropic/claude-3-opus"
    },
    {
      botId: "2",
      name: "Creative Muse",
      description: "Writing assistant for creative fiction, poetry, and imaginative content",
      icon: "✍️",
      color: "purple",
      rating: 4.8,
      categories: ["creative"],
      examples: [
        "Write a short story about a time traveler",
        "Help me brainstorm ideas for a fantasy novel",
        "Create a poem about autumn leaves"
      ],
      usageCount: 8320,
      modelId: "anthropic/claude-3-sonnet"
    },
    {
      botId: "3",
      name: "Math Genius",
      description: "Expert in mathematics from basic arithmetic to advanced calculus and statistics",
      icon: "🧮",
      color: "green",
      rating: 4.7,
      categories: ["math", "education"],
      examples: [
        "Solve this calculus problem",
        "Explain the binomial theorem",
        "Help me understand linear algebra"
      ],
      usageCount: 5670,
      modelId: "meta-llama/Llama-3-70b"
    },
    {
      botId: "4",
      name: "Travel Guide",
      description: "Your companion for travel planning, local recommendations, and cultural insights",
      icon: "🧳",
      color: "amber",
      rating: 4.6,
      categories: ["lifestyle", "productivity"],
      examples: [
        "Suggest a 7-day itinerary for Japan",
        "What should I know before visiting Morocco?",
        "Budget-friendly activities in Barcelona"
      ],
      usageCount: 7890,
      modelId: "anthropic/claude-3-sonnet"
    },
    {
      botId: "5",
      name: "Game Master",
      description: "Interactive storyteller for roleplaying adventures and text-based games",
      icon: "🎲",
      color: "red",
      rating: 4.9,
      categories: ["fun", "creative"],
      examples: [
        "Start a fantasy RPG adventure",
        "Create a mystery scenario for me to solve",
        "Let's play a text-based survival game"
      ],
      usageCount: 9240,
      modelId: "meta-llama/Llama-3-70b"
    },
    {
      botId: "6",
      name: "Fitness Coach",
      description: "Personal trainer for workout routines, nutrition advice, and fitness goals",
      icon: "💪",
      color: "cyan",
      rating: 4.5,
      categories: ["health", "lifestyle"],
      examples: [
        "Create a weekly workout plan for weight loss",
        "Suggest healthy meal ideas high in protein",
        "How do I improve my running endurance?"
      ],
      usageCount: 6120,
      modelId: "anthropic/claude-3-haiku"
    },
    {
      botId: "7",
      name: "Movie Buff",
      description: "Film expert for recommendations, analyses, and cinema history",
      icon: "🎬",
      color: "pink",
      rating: 4.7,
      categories: ["fun", "creative"],
      examples: [
        "Recommend movies similar to Inception",
        "Analyze the themes in Parasite",
        "Tell me about the French New Wave"
      ],
      usageCount: 5430,
      modelId: "meta-llama/Llama-3-70b"
    },
    {
      botId: "8",
      name: "Business Advisor",
      description: "Strategic consultant for business plans, marketing, and entrepreneurship",
      icon: "📊",
      color: "indigo",
      rating: 4.8,
      categories: ["productivity", "business"],
      examples: [
        "Help me create a business plan",
        "Suggest digital marketing strategies",
        "How do I pitch to investors?"
      ],
      usageCount: 7650,
      modelId: "anthropic/claude-3-opus"
    }
  ].filter(bot => category === 'all' || bot.categories.includes(category));
};

export default function ExplorePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  
  // State
  const [currentView, setCurrentView] = useState("explore");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [bots, setBots] = useState([]);
  const [filteredBots, setFilteredBots] = useState([]);
  const [selectedBot, setSelectedBot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatList, setChatList] = useState([]);
  
  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Fetch bots on mount and when category changes
  useEffect(() => {
    const loadBots = async () => {
      setIsLoading(true);
      const data = await fetchBots(selectedCategory);
      setBots(data);
      setFilteredBots(data);
      setIsLoading(false);
    };
    
    if (mounted) {
      loadBots();
    }
  }, [selectedCategory, mounted]);
  
  // Filter bots based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBots(bots);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = bots.filter(bot => 
      bot.name.toLowerCase().includes(query) || 
      bot.description.toLowerCase().includes(query)
    );
    
    setFilteredBots(filtered);
  }, [searchQuery, bots]);
  
  // Mock function to create chat with bot
  const startChatWithBot = async (bot) => {
    try {
      setIsLoading(true);
      // In a real app, this would create a chat in your database
      setTimeout(() => {
        router.push(`/c/new?bot=${bot.botId}`);
        toast.success(`Started a chat with ${bot.name}`);
      }, 500);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Failed to start chat");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load bot details
  const viewBotDetails = (bot) => {
    setSelectedBot(bot);
  };
  
  // Close bot details
  const closeBotDetails = () => {
    setSelectedBot(null);
  };
  
  if (!mounted) return null;
  
  return (
    <Layout 
      currentView="explore"
      chatList={chatList}
    >
      <div className="container mx-auto p-4 md:p-6">
        {/* Page header */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <Sparkles className="mr-2 h-6 w-6 text-primary" />
              Explore AI Bots
            </h1>
            <p className="text-muted-foreground">
              Discover specialized AI assistants for different tasks
            </p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-60">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
        
        {/* Categories */}
        <Tabs 
          defaultValue="all" 
          value={selectedCategory} 
          onValueChange={setSelectedCategory}
          className="mb-6"
        >
          <TabsList className="flex overflow-auto pb-1 mb-2 w-full justify-start sm:justify-center">
            {BOT_CATEGORIES.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-1.5"
              >
                {category.icon}
                <span>{category.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>
            
          {BOT_CATEGORIES.map((category) => (
            <TabsContent 
              key={category.id} 
              value={category.id}
              className="space-y-0 mt-2"
            >
              {/* Bots grid */}
              {selectedBot ? (
                <BotDetailsView
                  bot={selectedBot}
                  onBack={closeBotDetails}
                  onStartChat={startChatWithBot}
                />
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {isLoading ? (
                    Array(8).fill(0).map((_, index) => (
                      <div key={`skeleton-${index}`}>
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <Skeleton className="h-12 w-12 rounded-md" />
                              <Skeleton className="h-5 w-14" />
                            </div>
                            <Skeleton className="h-6 w-3/4 mt-3" />
                            <Skeleton className="h-4 w-full mt-2" />
                            <Skeleton className="h-4 w-2/3 mt-1" />
                          </CardHeader>
                          <CardContent className="pb-0">
                            <div className="flex gap-1 mt-2">
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-20" />
                            </div>
                          </CardContent>
                          <CardFooter className="flex gap-2 border-t p-4 mt-4">
                            <Skeleton className="h-9 w-full" />
                            <Skeleton className="h-9 w-full" />
                          </CardFooter>
                        </Card>
                      </div>
                    ))
                  ) : filteredBots.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                      <Bot className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">No bots found</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Try adjusting your search or filter to find what you're looking for.
                      </p>
                      {searchQuery && (
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => setSearchQuery("")}
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  ) : (
                    filteredBots.map((bot) => (
                      <motion.div key={bot.botId} variants={itemVariants}>
                        <BotCard
                          bot={bot}
                          onView={() => viewBotDetails(bot)}
                          onStartChat={() => startChatWithBot(bot)}
                        />
                      </motion.div>
                    ))
                  )}
                </motion.div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
}

// Bot Card Component
function BotCard({ bot, onView, onStartChat }) {
  const getBotColor = (color) => {
    const colorMap = {
      blue: "bg-blue-500/10 text-blue-500",
      purple: "bg-purple-500/10 text-purple-500",
      green: "bg-green-500/10 text-green-500",
      amber: "bg-amber-500/10 text-amber-500",
      red: "bg-red-500/10 text-red-500",
      indigo: "bg-indigo-500/10 text-indigo-500",
      pink: "bg-pink-500/10 text-pink-500",
      cyan: "bg-cyan-500/10 text-cyan-500"
    };
    
    return colorMap[color] || "bg-primary/10 text-primary";
  };
  
  const iconColorClass = getBotColor(bot.color || "blue");
  
  return (
    <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow border border-border">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className={`p-2 rounded-md ${iconColorClass}`}>
            <div className="text-2xl">{bot.icon}</div>
          </div>
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />
            {bot.rating}
          </Badge>
        </div>
        <CardTitle className="mt-3 text-xl">{bot.name}</CardTitle>
        <CardDescription className="line-clamp-3 h-[4.5rem]">
          {bot.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-0 flex-grow">
        <div className="flex flex-wrap gap-1 mt-auto">
          {bot.categories && bot.categories.map((category) => {
            const categoryInfo = BOT_CATEGORIES.find(c => c.id === category);
            return (
              <Badge key={category} variant="secondary" className="text-xs">
                {categoryInfo?.icon && <span className="mr-1">{categoryInfo.icon}</span>}
                {categoryInfo?.name || category}
              </Badge>
            );
          })}
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-2 border-t p-4 bg-muted/20 mt-4">
        <Button variant="outline" onClick={onView} className="flex-1">
          View Details
        </Button>
        <Button className="flex-1" onClick={onStartChat}>
          Start Chat
        </Button>
      </CardFooter>
    </Card>
  );
}

// Bot Details View
function BotDetailsView({ bot, onBack, onStartChat }) {
  const getBotColorClass = (color) => {
    const colorMap = {
      blue: "bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-800",
      purple: "bg-purple-500/10 text-purple-500 border-purple-200 dark:border-purple-800",
      green: "bg-green-500/10 text-green-500 border-green-200 dark:border-green-800",
      amber: "bg-amber-500/10 text-amber-500 border-amber-200 dark:border-amber-800",
      red: "bg-red-500/10 text-red-500 border-red-200 dark:border-red-800",
      indigo: "bg-indigo-500/10 text-indigo-500 border-indigo-200 dark:border-indigo-800",
      pink: "bg-pink-500/10 text-pink-500 border-pink-200 dark:border-pink-800",
      cyan: "bg-cyan-500/10 text-cyan-500 border-cyan-200 dark:border-cyan-800"
    };
    
    return colorMap[color] || "bg-primary/10 text-primary border-primary/20";
  };
  
  const colorClass = getBotColorClass(bot.color || "blue");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ChevronRight className="h-4 w-4 mr-1 rotate-180" />
        Back to all bots
      </Button>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bot info */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border border-border">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-md ${colorClass}`}>
                  <div className="text-2xl">
                    {bot.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{bot.name}</h2>
                    <Badge variant="outline">
                      <Star className="h-3 w-3 text-yellow-500 mr-1 fill-yellow-500" />
                      {bot.rating}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {bot.categories && bot.categories.map((category) => {
                      const categoryInfo = BOT_CATEGORIES.find(c => c.id === category);
                      return (
                        <Badge key={category} variant="secondary">
                          {categoryInfo?.icon && <span className="mr-1">{categoryInfo.icon}</span>}
                          {categoryInfo?.name || category}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {bot.description}
              </p>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-3xl font-bold text-primary">{bot.usageCount?.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Total Conversations</p>
                </div>
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-3xl font-bold flex items-center justify-center text-primary">
                    {bot.modelId?.split('/')[0] === 'anthropic' ? 'Claude' : 'Llama'}
                  </p>
                  <p className="text-sm text-muted-foreground">Base Model</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-center">
              <Button size="lg" onClick={() => onStartChat(bot)} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Start Chatting
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>About this bot</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This AI assistant specializes in {bot.categories?.map(c => {
                  const category = BOT_CATEGORIES.find(cat => cat.id === c);
                  return category?.name.toLowerCase() || c;
                }).join(', ')}. 
                It's powered by {bot.modelId?.split('/')[0] === 'anthropic' ? 'Claude' : 'Llama'} and 
                has been optimized to provide helpful, accurate responses in its domain of expertise.
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Examples and feedback */}
        <div className="space-y-6">
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>Try asking about</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bot.examples?.map((example, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-md text-sm">
                  "{example}"
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="border border-border">
            <CardHeader>
              <CardTitle>User feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span>Helpful</span>
                </div>
                <span className="text-muted-foreground">92%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4 text-red-500 rotate-180" />
                  <span>Not helpful</span>
                </div>
                <span className="text-muted-foreground">8%</span>
              </div>
              
              <div className="bg-muted/50 p-3 rounded-md text-sm italic text-muted-foreground">
                "This bot has been extremely helpful with my projects. Highly recommended!"
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}