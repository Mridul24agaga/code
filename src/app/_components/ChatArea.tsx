'use client';

import { useEffect, useState } from 'react';
import { UserButton } from "@clerk/nextjs";
import { Menu, Send, LoaderCircle } from "lucide-react";
import { Drawer, message } from 'antd';
import { useChat } from 'ai/react';

import Sidebar from './Sidebar';
import Messages from './Messages';
import { createNewChat, updateChat } from './../../actions/chats';
import chatsGlobalStore from '@/store/chats-store';
import usersGlobalStore from '@/store/users-store';

const ChatArea = () => {

  const [ showSidebarOnMobileResponsiveness, setShowSidebarOnMobileResponsiveness ] = useState(false);

  const { messages, setMessages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: 'api/chat',
    initialMessages: []
  });

  const { selectedChat, setSelectedChat, userChats, setUserChats }: any = chatsGlobalStore();

  const { loggedInUserData }: any = usersGlobalStore();

  const createOrUpdateChat = async () => {

    try {

      if (!selectedChat) {

        const response = await createNewChat({
          user: loggedInUserData._id,
          messages: messages,
          title: messages[0].content, 
        }); 

        if(response?.success) {

          setSelectedChat(response?.data);

          setUserChats([response?.data, ...userChats]);

        }

      } else {

        await updateChat({ chatId: selectedChat?._id, messagesArray: messages });

        const updatedChats = userChats.map((chat: any) => 
          chat._id === selectedChat._id ? { ...chat, messages } : chat
        );

        setUserChats(updatedChats);

      }
      
    } catch (error: any) {

      message.error('Something went wrong! Please try again!');
      
    }
  }

  useEffect(() => {

    if (messages.length > 0) {

      createOrUpdateChat();

    }
  }, [messages]);

  useEffect(() => {

    if(selectedChat) {

      setMessages(selectedChat?.messages);

    } else {

      setMessages([]);

    }
  }, [selectedChat]);

  return (
    <div className="flex flex-col flex-1 bg-chatareacolor p-5 overflow-y-auto">

      <div className="flex justify-between px-5">

        <div className="flex justify-center items-center gap-2">

          <Menu 
            className="text-white flex lg:hidden cursor-pointer" 
            onClick={() => setShowSidebarOnMobileResponsiveness(true)} 
            size={16}
          />

          <h1 className="text-sm lg:text-xl font-bold text-yellow-200 uppercase">Next Gemini ChatApp</h1>

        </div>

        <UserButton />

      </div>

      <div className="flex flex-col flex-1 justify-between">

        <div className="text-white">
          <Messages messages={messages} isLoading={isLoading} />
        </div>

        <form onSubmit={handleSubmit} className='relative mt-3'>

          <div className='flex items-center bg-sidebarcolor rounded focus-within:border focus-within:outline-none focus-within:border-gray-500'>
            
            <textarea
              name="prompt"
              value={input}
              onChange={handleInputChange}
              id="input"
              placeholder='Enter your prompt...'
              className='bg-sidebarcolor text-sm p-5 w-full rounded-l focus:outline-none text-gray-300 resize-none'
              style={{ flex: 1, maxHeight: '100px', overflowY: 'auto' }}
              rows={1}
            />

            {isLoading ? 
              <LoaderCircle className='text-gray-300 transition-all animate-spin duration-150 p-3' /> 
              : 
              <button type='submit' disabled={!input.trim()} className='p-3'>
                <Send 
                  className={`ml-3 ${!input.trim() ? 'text-gray-500 cursor-not-allowed' : 'text-gray-300 cursor-pointer'}`}
                />
              </button>
            }

        </div>
        
      </form>


      </div>

      {showSidebarOnMobileResponsiveness && 
        <Drawer 
          open={showSidebarOnMobileResponsiveness}
          onClose={() => setShowSidebarOnMobileResponsiveness(false)}
          placement='left'
        >
          <Sidebar />
        </Drawer>
      }
    </div>
  )
};

export default ChatArea;
