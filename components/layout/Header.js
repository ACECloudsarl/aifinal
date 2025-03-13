"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  Menu, Search, Bell, Command, Plus, X, 
  MessageCircle, ImageIcon, LayoutGrid, Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Header({ 
  setIsMobileMenuOpen, 
  currentView = "", 
  className 
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const getViewTitle = () => {
    const titles = {
      "home": "Welcome",
      "chat": "Chat",
      "history": "History",
      "create-image": "Create Images",
      "generations": "Image Gallery",
      "explore": "Explore Bots"
    };
    
    return titles[currentView] || "AI Chat";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileSearch(false);
    }
  };

  const toggleMobileSearch = () => {
    setMobileSearch(!mobileSearch);
  };

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 md:h-16 lg:gap-0",
      className
    )}>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      {/* Page Title (Mobile) */}
      {!mobileSearch && (
        <div className="flex-1 md:hidden">
          <h1 className="text-lg font-semibold">{getViewTitle()}</h1>
        </div>
      )}

      {/* Search Bar (Desktop + Mobile expanded) */}
      <form
        className={cn(
          "hidden h-9 md:flex md:flex-1 md:max-w-sm",
          mobileSearch ? "absolute inset-x-0 top-0 flex h-14 items-center bg-background px-4 sm:px-6 md:static md:h-auto" : ""
        )}
        onSubmit={handleSearch}
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 h-9 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>
        {mobileSearch && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-2 md:hidden"
            onClick={toggleMobileSearch}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close search</span>
          </Button>
        )}
        <kbd className="pointer-events-none absolute right-2.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </form>

      {/* Mobile Search Toggle */}
      {!mobileSearch && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileSearch}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      )}

      {/* Desktop Action Buttons */}
      <div className="hidden md:flex md:items-center md:gap-2">
        <Button asChild variant="ghost" size="icon">
          <Link href="/create-image">
            <ImageIcon className="h-5 w-5" />
            <span className="sr-only">Create Image</span>
          </Link>
        </Button>
        
        <Button asChild variant="ghost" size="icon">
          <Link href="/generations">
            <LayoutGrid className="h-5 w-5" />
            <span className="sr-only">Gallery</span>
          </Link>
        </Button>
        
        <Button asChild variant="ghost" size="icon">
          <Link href="/explore">
            <Bot className="h-5 w-5" />
            <span className="sr-only">Explore</span>
          </Link>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="ml-2 hidden md:flex"
          asChild
        >
          <Link href="/c/new">
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Link>
        </Button>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-transparent transition-colors hover:border-gray-200 dark:hover:border-gray-800"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                U
              </AvatarFallback>
            </Avatar>
            <span className="sr-only">User menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-medium">User Name</p>
              <p className="text-xs text-muted-foreground">
                user@example.com
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/support">Help & Support</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
        <Badge
          className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center bg-red-500 text-white"
        >
          <span className="sr-only">3 notifications</span>
        </Badge>
      </Button>
    </header>
  );
}