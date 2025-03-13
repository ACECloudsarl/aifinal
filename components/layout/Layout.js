"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

export default function Layout({ 
  children, 
  currentView = "home",
  currentChat = null,
  chatList = [],
  createNewChat
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;

  return (
    <div className="relative flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <Sidebar 
        currentChat={currentChat}
        currentView={currentView}
        chatList={chatList}
        createNewChat={createNewChat}
        className="hidden md:flex"
      />
      
      {/* Mobile Sidebar */}
      <MobileSidebar 
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
        currentChat={currentChat}
        currentView={currentView}
        chatList={chatList}
        createNewChat={createNewChat}
      />
      
      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          currentView={currentView}
        />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}