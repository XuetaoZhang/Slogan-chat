import Room from "@/models/room";
import User from "@/models/user";
import { Socket } from "socket.io-client";
import { create } from "zustand";

export interface GlobalStoreProps {
  selectedRoom: null | Room;
  RoomDetailsData: null | Room | User;
  rightBarRoute: string;
  onlineUsers: { socketID: string; userID: string }[];
  socket: null | Socket;
  isRoomDetailsShown: boolean;
  shouldCloseAll: boolean;
  isChatPageLoaded: boolean;
  showCreateRoomBtn: boolean;
  createRoomType: "channel" | "group" | null;
}

interface Updater {
  updater: (
    key: keyof GlobalStoreProps,
    value: GlobalStoreProps[keyof GlobalStoreProps]
  ) => void;
  setter: (
    state:
      | Partial<GlobalStoreProps>
      | ((prev: GlobalStoreProps) => Partial<GlobalStoreProps>)
  ) => void;
}

const useGlobalStore = create<GlobalStoreProps & Updater>((set) => ({
  selectedRoom: null,
  RoomDetailsData: null,
  rightBarRoute: "/",
  onlineUsers: [],
  socket: null,
  shouldCloseAll: false,
  isRoomDetailsShown: false,
  isChatPageLoaded: false,
  showCreateRoomBtn: true,
  createRoomType: null,

  updater(
    key: keyof GlobalStoreProps,
    value: GlobalStoreProps[keyof GlobalStoreProps]
  ) {
    set({ [key]: value });
  },

  setter: set,
}));

export default useGlobalStore;
