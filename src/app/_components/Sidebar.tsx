import { Plus, Trash2 } from 'lucide-react';
import { Spin, message } from "antd";
import classNames from "classnames";
import React, { useEffect, useState } from "react";

import { deleteChat, getAllChatsByUserId } from "@/actions/chats";
import chatsGlobalStore from "@/store/chats-store";
import usersGlobalStore from "@/store/users-store";


const Sidebar = () => {

  const [hoveredChatId, setHoveredChatId] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const [loadingChatDelete, setLoadingChatDelete] = useState<boolean>(false);

  const { loggedInUserData } = usersGlobalStore() as any;

  const { userChats, setUserChats, selectedChat, setSelectedChat }: any = chatsGlobalStore();

  const getAllChatsOfAuthenticatedUser = async () => {

    try {

      setLoading(true);

      const response = await getAllChatsByUserId(loggedInUserData._id);

      if (response.success) {

        setUserChats(response.data);

      } else {

        message.error('Something went wrong!! Please try again!!');

      }
    } catch (error) {

      message.error('Something went wrong!! Please try again!!');

    } finally {

      setLoading(false);

    }
  };


  const deleteChatHandler = async (chatId: string, event: React.MouseEvent) => {

    event.stopPropagation();
    
    try {

      setLoadingChatDelete(true);

      const response = await deleteChat(chatId);

      if (response.success) {

        const updatedChatHistory = userChats.filter(
          (chat: any) => chat._id !== chatId
        );

        setUserChats(updatedChatHistory);
        
        if (selectedChat?._id === chatId) {

          setSelectedChat(null);

        }

      }
      
    } catch (error: any) {

      message.error(error.message);
      
    } finally {

      setLoadingChatDelete(false);

    }
  };

  useEffect(() => {
    getAllChatsOfAuthenticatedUser();
  }, []);
  

  return (
    <div className="w-80 h-full flex flex-col gap-3 justify-between bg-sidebarcolor p-5">
      
      <div className="flex-1 overflow-y-auto">

        <div 
          className='flex items-center justify-center gap-2 border border-gray-200 border-solid text-gray-200 p-2 rounded-sm w-max text-sm cursor-pointer'
          onClick={() => {

            setSelectedChat(null);

          }}
        >
          <Plus size={15} />
          <span>New Chat</span>
        </div>

        <div className="flex flex-col gap-3 mt-7">
          <h1 className="text-sm text-gray-300 font-bold p-2">
            Your Chat History
          </h1>

          {loading && <Spin size='large' className='h-60 flex items-center justify-center sidebar-spinner' />}
          
          {!loading && userChats?.length === 0 && <p className='text-gray-400 text-sm p-2'>Nothing to Show</p>}
          
          {!loading && userChats?.length !== 0 && userChats?.map((chat: any) => (
            <div
              className={classNames(
                "cursor-pointer flex justify-between items-center p-2 hover:bg-gray-500 hover:bg-opacity-30",
                {
                  "bg-gray-600 rounded bg-opacity-30": selectedChat?._id === chat._id,
                }
              )}
              onMouseEnter={() => setHoveredChatId(chat._id)}
              onMouseLeave={() => setHoveredChatId("")}
              onClick={() => {
                setSelectedChat(chat);
              }}
            >
              <span className="text-sm text-gray-300">
                {chat.title.split(' ').length <= 3 ? chat.title : chat.title.split(' ').slice(0, 3).join(' ') + ' . . . .'}
              </span>

              {hoveredChatId === chat._id && (
                loadingChatDelete ? 
                  <Spin className='sidebar-spinner' size='default' /> 
                  : 
                  <Trash2
                    size={15}
                    className="text-red-400"
                    onClick={(e) => deleteChatHandler(chat._id, e)}
                  />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 p-3">

        <span className="text-gray-400 text-xs">
          Designed & Developed by
        </span>

        <hr className='border border-solid border-gray-500 w-10' />

        <span className="text-gray-400 text-xs">
          Somenath Choudhury
        </span>

      </div>

    </div>
  )
};

export default Sidebar;
