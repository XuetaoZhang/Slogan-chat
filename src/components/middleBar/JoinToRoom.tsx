import { Socket } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import Room from "@/models/room";
import Button from "../modules/ui/Button";
import Loading from "../modules/ui/Loading";

interface Props {
  roomData: Room;
  roomSocket: Socket | null;
  userID: string;
}

const JoinToRoom = ({ roomData, roomSocket, userID }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);

  const joinRoom = () => {
    clearTimeout(timer.current!);

    setIsLoading(true);

    timer.current = setTimeout(() => {
      roomSocket?.emit("joinRoom", { roomID: roomData._id, userID });
      if (timer.current) {
        clearTimeout(timer.current);
      }
    }, 1000);
  };

  useEffect(() => {
    roomSocket?.on("joinRoom", () => {
      setIsLoading(false);
    });
  }, [roomSocket]);

  return (
    <Button
      disabled={isLoading}
      onClick={joinRoom}
      className="bg-darkBlue min-h-12 w-full text-base cursor-pointer"
    >
      {!isLoading ? "Join" : <Loading classNames="text-white" />}
    </Button>
  );
};

export default JoinToRoom;
