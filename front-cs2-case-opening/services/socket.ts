import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("EXPO_PUBLIC_API_URL is not defined");
  }
    
export const socket: Socket = io(API_URL, {
  transports: ['websocket'],
  autoConnect: false,
});
