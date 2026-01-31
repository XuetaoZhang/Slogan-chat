import Message from "@/models/message";
import { Dispatch, SetStateAction, useEffect } from "react";
import { DefaultEventsMap } from "socket.io";
import { Socket } from "socket.io-client";

interface useTypingProps {
  rooms: Socket<DefaultEventsMap, DefaultEventsMap> | null;
  roomID: string;
  myName: string;
  setTypings: Dispatch<SetStateAction<string[]>>;
}

const useTyping = ({ rooms, roomID, myName, setTypings }: useTypingProps) => {
  useEffect(() => {
    const handleTyping = (data: Message) => {
      if (data.sender.name !== myName && data.roomID === roomID) {
        setTypings((prev) => [...prev, data.sender.name]);
      }
    };

    const handleStopTyping = (data: Message) => {
      setTypings((prev) =>
        prev.filter((tl) => tl !== data.sender.name && tl !== myName)
      );
    };

    rooms?.on("typing", handleTyping);
    rooms?.on("stop-typing", handleStopTyping);

    return () => {
      rooms?.off("typing", handleTyping);
      rooms?.off("stop-typing", handleStopTyping);
    };
  }, [rooms, roomID, myName, setTypings]);
};

export default useTyping;
