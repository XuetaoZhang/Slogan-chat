import Room from "@/models/room";
import User from "@/models/user";
import { GlobalStoreProps } from "@/stores/globalStore";
import { UserStoreUpdater } from "@/stores/userStore";
import { useEffect } from "react";
import { DefaultEventsMap } from "socket.io";
import { Socket } from "socket.io-client";

interface useRoomEventsProps {
  rooms: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  selectedRoom: Room | null;
  setter: (
    state:
      | Partial<GlobalStoreProps>
      | ((prev: GlobalStoreProps) => Partial<GlobalStoreProps>)
  ) => void;
  myID: string;
  userDataUpdater: (
    state:
      | Partial<User & UserStoreUpdater>
      | ((prev: User & UserStoreUpdater) => Partial<User & UserStoreUpdater>)
  ) => void;
  userRooms: Room[];
}
const useRoomEvents = ({
  rooms,
  selectedRoom,
  setter,
  myID,
  userDataUpdater,
  userRooms,
}: useRoomEventsProps) => {
  useEffect(() => {
    const handleJoinRoom = ({
      userID,
      roomID,
    }: {
      userID: string;
      roomID: string;
    }) => {
      if (selectedRoom?._id === roomID) {
        const updatedRoom = {
          ...selectedRoom,
          participants: [...selectedRoom?.participants, userID],
        };

        setter({ selectedRoom: updatedRoom });

        if (userID === myID) {
          userDataUpdater({ rooms: [...userRooms, updatedRoom] });
          rooms?.emit("joining", selectedRoom?._id);
        }
      }
    };

    const handleListenToVoice = ({
      userID,
      voiceID,
      roomID,
    }: {
      userID: string;
      roomID: string;
      voiceID: string;
    }) => {
      if (selectedRoom?._id !== roomID) return;

      setter((prev) => ({
        selectedRoom: {
          ...prev.selectedRoom!,
          messages:
            prev.selectedRoom?.messages.map((msg) =>
              msg._id === voiceID &&
              msg?.voiceData &&
              typeof msg.voiceData.playedBy === "object" &&
              !msg.voiceData.playedBy.includes(userID)
                ? {
                    ...msg,
                    voiceData: {
                      ...msg.voiceData,
                      playedBy: [...msg.voiceData.playedBy, userID],
                    },
                  }
                : msg
            ) || [],
        },
      }));
    };

    rooms?.on("joinRoom", handleJoinRoom);
    rooms?.on("listenToVoice", handleListenToVoice);

    return () => {
      rooms?.off("joinRoom", handleJoinRoom);
      rooms?.off("listenToVoice", handleListenToVoice);
    };
  }, [rooms, selectedRoom, setter, myID, userDataUpdater, userRooms]);
};

export default useRoomEvents;
