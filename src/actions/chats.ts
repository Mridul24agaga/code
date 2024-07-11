'use server';

import ChatModel from '@/models/chat-model';

export const createNewChat = async (chatsFromFrontend: any) => {
  try {

    const response = await ChatModel.create(chatsFromFrontend);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(response)),
    };

  } catch (error: any) {
    return {
      success: false,
      message: error?.message,
    };
  }
};

export const getAllChatsByUserId = async (userId: string) => {
  try {
    const response = await ChatModel.find({ user: userId }).sort({
      createdAt: -1,
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(response)),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message,
    };
  }
};

export const updateChat = async ({
  chatId,
  messagesArray,
}: {
  chatId: string;
  messagesArray: any[];
}) => {
  try {
    const response = await ChatModel.findByIdAndUpdate(
      chatId,
      { messages: messagesArray },
      { new: true }
    );

    return {
      success: true,
      data: JSON.parse(JSON.stringify(response)),
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message,
    };
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    await ChatModel.findByIdAndDelete(chatId);

    return {
      success: true,
      data: 'chat deleted successfully',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message,
    };
  }
};
