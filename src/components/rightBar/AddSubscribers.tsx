import { UserStoreUpdater } from "@/stores/userStore";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import User from "@/models/user";
import useGlobalStore from "@/stores/globalStore";
import useSockets from "@/stores/useSockets";
import Room from "@/models/room";
import { FiUserPlus } from "react-icons/fi";
import RoomCard from "./RoomCard";
import Loading from "../modules/ui/Loading";

interface AddMembersProps {
  setCanSubmit: Dispatch<SetStateAction<boolean>>;
  submitChanges: boolean;
  setSubmitChanges: Dispatch<SetStateAction<boolean>>;
  roomData: User & Room;
  myData: User & UserStoreUpdater;
}

const AddSubscribers = ({ roomData, myData }: AddMembersProps) => {
  const { onlineUsers, selectedRoom, setter, rightBarRoute } = useGlobalStore(
    (state) => state
  );
  const roomSocket = useSockets((state) => state.rooms);
  const roomID = selectedRoom?._id;

  const [subscribers, setSubscribers] = useState<User[]>([]);
  const [administrators, setAdministrators] = useState<User[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Get subscribers
  useEffect(() => {
    if (!roomSocket || !roomID) return;
    setIsLoading(true);
    roomSocket.emit("getRoomMembers", { roomID });

    roomSocket.once("getRoomMembers", (participants) => {
      setSubscribers(participants);
      setIsLoading(false);
    });

    return () => {
      roomSocket.off("getRoomMembers");
    };
  }, [roomID, roomSocket]);

  // Find administrators from subscribers
  useEffect(() => {
    if (!subscribers || subscribers.length === 0) return;

    setAdministrators(
      subscribers.filter((subscriber) =>
        roomData.admins.includes(subscriber._id)
      )
    );
  }, [subscribers, roomData.admins]);

  const isUserOnline = (id: string) => {
    return onlineUsers.some((data) => {
      if (data.userID === id) return true;
    });
  };

  return (
    <>
      {rightBarRoute === "/add-subscribers" && (
        <div
          className="flex items-center gap-4 text-sm p-3 text-darkBlue cursor-pointer hover:bg-white/5 transition-all duration-200"
          onClick={() => setter({ rightBarRoute: "/add-channel-members" })}
        >
          <FiUserPlus className="size-5 scale-x-[-1] pb-0.5 " />
          <span>Add Subscribers</span>
        </div>
      )}
      <div className="h-2 bg-black"></div>
      <p className="text-lightBlue px-3 text-sm py-2">
        {rightBarRoute === "/add-subscribers" && "Subscribers"}
      </p>
      <div className="px-1">
        <div className="flex flex-col mt-1 w-full">
          {rightBarRoute === "/add-subscribers" ? (
            isLoading ? (
              <Loading classNames="mx-auto" />
            ) : subscribers?.length ? (
              subscribers?.map((member) => (
                <RoomCard
                  key={member._id}
                  {...member}
                  myData={myData}
                  isOnline={isUserOnline(member._id)}
                  setSubscribers={setSubscribers}
                />
              ))
            ) : null
          ) : isLoading ? (
            <Loading classNames="mx-auto" />
          ) : subscribers?.length ? (
            administrators?.map((member) => (
              <RoomCard
                key={member._id}
                {...member}
                myData={myData}
                isOnline={isUserOnline(member._id)}
                setSubscribers={setSubscribers}
              />
            ))
          ) : null}
        </div>
        {rightBarRoute === "/add-subscribers" && (
          <div className="text-xs text-gray-400 py-3 px-2">
            Only channel admins can see this list.
          </div>
        )}
        {rightBarRoute === "/administrators" && (
          <div className="text-xs text-gray-400 py-3 px-2">
            You can add admins to help you manage your channel.
          </div>
        )}
      </div>
    </>
  );
};

export default AddSubscribers;
