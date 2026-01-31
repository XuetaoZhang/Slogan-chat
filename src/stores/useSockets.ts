import { Socket } from "socket.io-client";
import { create } from "zustand";

export interface SocketsProps {
  rooms: Socket | null;
  roomsNs: Socket | null;
  updater: (
    key: keyof SocketsProps,
    value: SocketsProps[keyof SocketsProps]
  ) => void;
  setter: (
    partialState:
      | Partial<SocketsProps>
      | ((state: SocketsProps) => Partial<SocketsProps>)
  ) => void;
}

const useSockets = create<SocketsProps>((set) => ({
  rooms: null,
  roomsNs: null,

  updater(key: keyof SocketsProps, value: SocketsProps[keyof SocketsProps]) {
    set({ [key]: value });
  },
  setter: set,
}));

export default useSockets;
