'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UserButton } from "@clerk/nextjs";
import { Menu, Send, LoaderCircle, Paperclip, Plus, Code } from "lucide-react";
import { Drawer } from 'antd';
import { useChat } from 'ai/react';

import CodeSidebar from './CodeSidebar';
import { createNewChat, updateChat } from './../../actions/chats';
import chatsGlobalStore from '@/store/chats-store';
import usersGlobalStore from '@/store/users-store';

const exampleQueries = [
  "Generate a multi-step onboarding flow",
  "How can I schedule cron jobs?",
  "Calculate the factorial of a number"
];

const ChatArea: React.FC = () => {
  const [showSidebarOnMobileResponsiveness, setShowSidebarOnMobileResponsiveness] = useState(false);
  const [showCodeSidebar, setShowCodeSidebar] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');

  const { messages, setMessages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: 'api/chat',
    initialMessages: []
  });

  const { selectedChat, setSelectedChat, userChats, setUserChats }: any = chatsGlobalStore();
  const { loggedInUserData }: any = usersGlobalStore();

  const createOrUpdateChat = useCallback(async () => {
    try {
      if (!selectedChat) {
        const response = await createNewChat({
          user: loggedInUserData._id,
          messages: messages,
          title: messages[0].content, 
        }); 

        if(response?.success) {
          setSelectedChat(response?.data);
          setUserChats((prevChats: any) => [response?.data, ...prevChats]);
        }
      } else {
        await updateChat({ chatId: selectedChat?._id, messagesArray: messages });
        setUserChats((prevChats: any) => 
          prevChats.map((chat: any) => 
            chat._id === selectedChat._id ? { ...chat, messages } : chat
          )
        );
      }
    } catch (error: any) {
      console.error('Error creating or updating chat:', error);
    }
  }, [selectedChat, messages, loggedInUserData._id, setSelectedChat, setUserChats]);

  useEffect(() => {
    if (messages.length > 0) {
      createOrUpdateChat();
    }
  }, [messages, createOrUpdateChat]);

  useEffect(() => {
    if(selectedChat) {
      setMessages(selectedChat?.messages);
    } else {
      setMessages([]);
    }
  }, [selectedChat, setMessages]);

  const generateFactorialCode = (n: number) => {
    const code = `
function factorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  return n * factorial(n - 1);
}

console.log(factorial(${n}));
    `;
    return code.trim();
  };

  const renderContent = useCallback((content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const [, language, code] = part.match(/```(\w+)?\n([\s\S]*?)\n```/) || [, 'plaintext', part.slice(3, -3)];
        const trimmedCode = code.trim();
        if (trimmedCode !== generatedCode) {
          setGeneratedCode(trimmedCode);
          setShowCodeSidebar(true);
        }
        return (
          <div key={index} className="relative my-4">
            <pre className="bg-zinc-800 p-4 rounded-md overflow-x-auto">
              <code className="text-sm text-zinc-100">{trimmedCode}</code>
            </pre>
            <button
              onClick={() => setShowCodeSidebar(true)}
              className="absolute top-2 right-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <Code className="h-5 w-5" />
            </button>
          </div>
        );
      }
      
      const sections = part.split(/(?=\*\s)/).filter(Boolean);
      
      return (
        <div key={index} className="space-y-4 text-zinc-100">
          {sections.map((section, sectionIndex) => {
            // Check if the section contains a factorial calculation request
            const factorialMatch = section.match(/calculate\s+the\s+factorial\s+of\s+(\d+)/i);
            if (factorialMatch) {
              const number = parseInt(factorialMatch[1], 10);
              const factorialCode = generateFactorialCode(number);
              setGeneratedCode(factorialCode);
              setShowCodeSidebar(true);
              return (
                <div key={sectionIndex} className="break-words max-w-full">
                  <p className="whitespace-pre-wrap mb-2">{section}</p>
                  <div className="relative my-4">
                    <pre className="bg-zinc-800 p-4 rounded-md overflow-x-auto">
                      <code className="text-sm text-zinc-100">{factorialCode}</code>
                    </pre>
                    <button
                      onClick={() => setShowCodeSidebar(true)}
                      className="absolute top-2 right-2 text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <Code className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            }
            return (
              <div key={sectionIndex} className="break-words max-w-full">
                <p 
                  className="whitespace-pre-wrap" 
                  dangerouslySetInnerHTML={{ 
                    __html: section
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-zinc-800 rounded text-sm">$1</code>')
                  }} 
                />
              </div>
            );
          })}
        </div>
      );
    });
  }, [generatedCode]);

  return (
    <div className="flex h-screen w-full bg-zinc-900 relative overflow-hidden">
      {/* Main chat area with responsive width */}
      <div className={`flex flex-col w-full transition-all duration-300 ease-in-out ${
        showCodeSidebar ? 'lg:w-[60%] md:w-[55%]' : 'w-full'
      }`}>
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-zinc-900 to-zinc-900"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[40vw] font-bold text-zinc-800/20 select-none pointer-events-none">
              SC
            </div>
          </div>
          <div className="absolute inset-0 bg-zinc-900/30"></div>
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <button
                className="text-zinc-400 hover:text-zinc-100 lg:hidden"
                onClick={() => setShowSidebarOnMobileResponsiveness(true)}
                aria-label="Open menu"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-lg font-bold text-zinc-50 truncate">SC - AI For Everything</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-1 text-zinc-400 hover:text-zinc-100 border border-zinc-700 rounded-md"
                onClick={() => setShowCodeSidebar(prev => !prev)}
                aria-label={showCodeSidebar ? "Hide code" : "Show code"}
              >
                <Code className="h-4 w-4" />
              </button>
              <UserButton />
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col w-full">
            <div className={`flex-1 overflow-y-auto p-4 ${showCodeSidebar ? 'md:pr-[45%] lg:pr-[40%]' : ''}`}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8 text-zinc-50">What can I help you ship?</h2>
                  <div className="flex flex-wrap justify-center gap-2">
                    {exampleQueries.map((query) => (
                      <button
                        key={query}
                        onClick={() => handleInputChange({ target: { value: query } } as any)}
                        className="px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-700/50 transition-colors"
                      >
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 max-w-full">
                  {messages.map((message) => (
                    <div key={message.id} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-zinc-200">
                          {message.role === 'user' ? 'You' : 'Assistant'}
                        </div>
                      </div>
                      <div className="break-words overflow-x-hidden">
                        {renderContent(message.content)}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className={`p-2 border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm ${showCodeSidebar ? 'md:pr-[45%] lg:pr-[40%]' : ''}`}>
              <div className="flex items-center bg-zinc-800/50 backdrop-blur-sm rounded-lg border border-zinc-700 focus-within:ring-2 focus-within:ring-zinc-600">
                <button type="button" className="p-2 text-zinc-400 hover:text-zinc-300" aria-label="Attach file">
                  <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button type="button" className="p-2 text-zinc-400 hover:text-zinc-300" aria-label="Add item">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <textarea
                  name="prompt"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Message SC..."
                  className="flex-1 p-2 bg-transparent text-zinc-50 placeholder-zinc-400 resize-none focus:outline-none text-sm sm:text-base min-h-[44px]"
                  rows={1}
                  style={{ maxHeight: '200px' }}
                />
                {isLoading ? (
                  <LoaderCircle className="animate-spin text-zinc-400 mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <button 
                    type="submit" 
                    disabled={!input.trim()} 
                    className="p-2 text-zinc-400 hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile sidebar drawer */}
      <Drawer 
        open={showSidebarOnMobileResponsiveness}
        onClose={() => setShowSidebarOnMobileResponsiveness(false)}
        placement='left'
        className="lg:hidden"
      >
        {/* Add your Sidebar component here */}
      </Drawer>

      {/* Code sidebar with improved responsiveness */}
      {showCodeSidebar && (
        <div className="fixed right-0 top-0 h-screen bg-[#1E1E1E] border-l border-zinc-800 overflow-hidden transition-all duration-300 ease-in-out w-full md:w-[45%] lg:w-[40%] z-50">
          <CodeSidebar
            code={generatedCode}
            onClose={() => setShowCodeSidebar(false)}
          />
        </div>
      )}
    </div>
  );
};

export default ChatArea;