import api from "./api";

export const getChats = async (token) => {
  const response = await api.get("/chats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createChat = async (chatData, token) => {
  const response = await api.post("/chats", chatData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getMessages = async (chatId, token) => {
  const response = await api.get(`/messages/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const sendMessage = async (chatId, messageData, token) => {
  const response = await api.post(`/messages/${chatId}`, messageData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};