'use client'

import React, { useEffect, useState } from "react"
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Spin, message } from "antd"
import classNames from "classnames"

import { deleteChat, getAllChatsByUserId } from "@/actions/chats"
import chatsGlobalStore from "@/store/chats-store"
import usersGlobalStore from "@/store/users-store"

const Sidebar = () => {
  const [hoveredChatId, setHoveredChatId] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingChatDelete, setLoadingChatDelete] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(true)

  const { loggedInUserData } = usersGlobalStore() as any
  const { userChats, setUserChats, selectedChat, setSelectedChat }: any = chatsGlobalStore()

  const getAllChatsOfAuthenticatedUser = async () => {
    try {
      setLoading(true)
      const response = await getAllChatsByUserId(loggedInUserData._id)
      if (response.success) {
        setUserChats(response.data)
      } else {
        message.error('Something went wrong! Please try again.')
      }
    } catch (error) {
      message.error('Something went wrong! Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const deleteChatHandler = async (chatId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    try {
      setLoadingChatDelete(true)
      const response = await deleteChat(chatId)
      if (response.success) {
        const updatedChatHistory = userChats.filter(
          (chat: any) => chat._id !== chatId
        )
        setUserChats(updatedChatHistory)
        if (selectedChat?._id === chatId) {
          setSelectedChat(null)
        }
      }
    } catch (error: any) {
      message.error(error.message)
    } finally {
      setLoadingChatDelete(false)
    }
  }

  useEffect(() => {
    getAllChatsOfAuthenticatedUser()
  }, [])

  return (
    <div className={classNames(
      "h-full flex flex-col justify-between bg-black text-white transition-all duration-300 ease-in-out",
      isOpen ? "w-80" : "w-16"
    )}>
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between p-4">
          {isOpen && <h2 className="text-xl font-bold">Chats</h2>}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
            aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <div className="px-4 mb-4">
          <button
            className='flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-md w-full text-sm transition-colors duration-200'
            onClick={() => setSelectedChat(null)}
          >
            <Plus size={15} />
            {isOpen && <span>New Chat</span>}
          </button>
        </div>

        <div className="flex flex-col gap-2 px-4">
          {isOpen && (
            <h3 className="text-sm text-gray-400 font-semibold mb-2">
              Chat History
            </h3>
          )}

          {loading && <Spin size='large' className='h-60 flex items-center justify-center' />}
          
          {!loading && Array.isArray(userChats) && userChats.length === 0 && isOpen && (
            <p className='text-gray-400 text-sm'>No chats yet</p>
          )}
          
          {!loading && Array.isArray(userChats) && userChats.length > 0 && userChats.map((chat: any) => (
            <div
              key={chat._id}
              className={classNames(
                "cursor-pointer flex justify-between items-center p-2 rounded-md hover:bg-gray-800 transition-colors duration-200",
                {
                  "bg-gray-700": selectedChat?._id === chat._id,
                }
              )}
              onMouseEnter={() => setHoveredChatId(chat._id)}
              onMouseLeave={() => setHoveredChatId("")}
              onClick={() => setSelectedChat(chat)}
            >
              <span className="text-sm truncate flex-1">
                {isOpen ? chat.title : chat.title.charAt(0)}
              </span>

              {isOpen && hoveredChatId === chat._id && (
                loadingChatDelete ? 
                  <Spin size='small' /> 
                  : 
                  <button
                    aria-label="Delete chat"
                    onClick={(e) => deleteChatHandler(chat._id, e)}
                  >
                    <Trash2
                      size={15}
                      className="text-red-400 hover:text-red-300"
                    />
                  </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Sidebar