import Image from "next/image";
import { TbMessage } from "react-icons/tb";
import { IoCopyOutline } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
import { toaster } from "@/utils";
import { copyText as copyFn } from "@/utils";
import User from "@/models/user";
import useGlobalStore from "@/stores/globalStore";
import { UserStoreUpdater } from "@/stores/userStore";
import useSockets from "@/stores/useSockets";
import Loading from "../modules/ui/Loading";
import Room from "@/models/room";
import RoomCard from "./RoomCard";
import { FiUserPlus } from "react-icons/fi";
import { LuUsers } from "react-icons/lu";
import { RiShieldStarLine } from "react-icons/ri";
import ProfileImageViewer from "@/components/modules/ProfileImageViewer";
import ProfileGradients from "../modules/ProfileGradients";

interface RoomDetailsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedRoomData: any;
  myData: User & UserStoreUpdater;
  roomData: User & Room;
}

const RoomDetails = ({
  selectedRoomData,
  myData,
  roomData,
}: RoomDetailsProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [groupMembers, setGroupMembers] = useState<User[]>([]);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const {
    setter,
    isRoomDetailsShown,
    selectedRoom,
    RoomDetailsData,
    onlineUsers,
  } = useGlobalStore((state) => state) || {};

  // const myData = useUserStore((state) => state);
  const roomSocket = useSockets((state) => state.rooms);

  const { _id: myID, rooms } = myData;
  // const selectedRoomData: any = RoomDetailsData ?? selectedRoom;
  const { participants, type, _id: roomID } = { ...selectedRoomData };

  const onlineUsersCount = participants?.filter((pId: string) =>
    onlineUsers.some((data) => {
      if (data.userID === pId) return true;
    })
  ).length;

  const {
    avatar = "",
    name = "",
    lastName = "",
    username,
    link,
    _id,
    biography,
  } = roomData;

  useEffect(() => {
    if (!roomSocket || !roomID || !isRoomDetailsShown) return;

    if (type?.length && type !== "private" && roomID) {
      try {
        setIsLoading(true);

        roomSocket.emit("getRoomMembers", { roomID });
        roomSocket.on("getRoomMembers", (participants) => {
          setGroupMembers(participants);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        toaster("error", error);
      } finally {
        setIsLoading(false);
      }
    }
    return () => {
      setGroupMembers([]);
      roomSocket.off("getRoomMembers");
    };
  }, [roomSocket, roomID, isRoomDetailsShown, type]);

  const copyText = async () => {
    await copyFn((username && "@" + username) || link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const openChat = () => {
    const isInRoom = selectedRoom?._id === roomID;
    if (isInRoom) return setter({ isRoomDetailsShown: false });
    const roomHistory = rooms.find(
      (data) =>
        data.name === myID + "-" + _id ||
        data.name === _id + "-" + myID ||
        data._id == roomID
    );

    const roomSelected: Omit<Room, "_id" | "lastMsgData" | "notSeenCount"> = {
      admins: [myData._id, _id],
      avatar,
      createdAt: Date.now().toString(),
      creator: myData._id,
      link: (Math.random() * 9999999).toString(),
      locations: [],
      medias: [],
      messages: [],
      name: myData._id + "-" + _id,
      participants: [myData, selectedRoomData] as (string | User)[],
      type: "private",
      updatedAt: Date.now().toString(),
    };
    if (roomHistory) {
      roomSocket?.emit("joining", roomHistory._id);
    } else {
      setter({
        selectedRoom:
          type === "private"
            ? (roomSelected as Room)
            : (RoomDetailsData as Room),
        RoomDetailsData: null,
      });
    }

    setter({ isRoomDetailsShown: false });
  };

  const isUserOnline = useCallback(
    (userId: string) => {
      return onlineUsers.some((data) => {
        if (data.userID === userId) return true;
      });
    },
    [onlineUsers]
  );

  return (
    <>
      <div className=" bg-chatBg py-2 relative chatBackground">
        <div className="flex items-center gap-3 pb-4 px-2">
          {avatar ? (
            <Image
              src={avatar}
              className="cursor-pointer object-cover size-12 rounded-full"
              width={48}
              height={48}
              alt="avatar"
              onClick={() => setIsViewerOpen(true)}
            />
          ) : (
            <ProfileGradients
              classNames="size-11 text-center text-lg "
              id={_id}
            >
              {name?.length && name![0]}
            </ProfileGradients>
          )}

          <div className="flex justify-center flex-col gap-1 text-ellipsis w-[80%]">
            <h3 className="font-vazirBold text-base truncate">
              {name + " " + lastName}
            </h3>

            <div className="text-sm text-darkGray font-vazirBold line-clamp-1 whitespace-normal text-nowrap">
              {type === "private" ? (
                onlineUsers.some((data) => {
                  if (data.userID == _id) return true;
                }) ? (
                  <span className="text-lightBlue">Online</span>
                ) : (
                  "last seen recently"
                )
              ) : type === "group" ? (
                `${participants?.length} members ${
                  onlineUsersCount ? ", " + onlineUsersCount + " online" : ""
                }`
              ) : (
                `${participants?.length} subscribers`
              )}
            </div>
          </div>
        </div>

        {type === "private" && roomID !== myID && (
          <span
            onClick={openChat}
            className="absolute right-3 -bottom-6 size-12 rounded-full cursor-pointer bg-darkBlue flex-center"
          >
            <TbMessage className="size-6" />
          </span>
        )}
      </div>

      <div className="px-3 my-3 space-y-4">
        <p className="text-lightBlue">Info</p>

        {biography && (
          <div>
            <p className="text-[16px]">{biography}</p>
            <p className="text-darkGray text-[13px]">Bio</p>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div>
            <p className="font-vazirLight text-base">
              {(username && "@" + username) || link}
            </p>
            <p className="text-darkGray text-sm">
              {type === "private" ? "Username" : "Link"}
            </p>
          </div>

          <div
            onClick={copyText}
            className=" cursor-pointer rounded px-2 transition-all duration-300"
          >
            {isCopied ? (
              <p className="text-sm" data-aos="zoom-out">
                Copied
              </p>
            ) : (
              <IoCopyOutline data-aos="zoom-out" className="size-5" />
            )}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p>Notifications</p>

            <p className="text-darkGray text-sm">
              {notifications ? "On" : "Off"}
            </p>
          </div>

          <input
            type="checkbox"
            defaultChecked={notifications}
            className="toggle toggle-info toggle-xs mt-1 mr-1 outline-none"
            onChange={() => setNotifications(!notifications)}
          />
        </div>
      </div>

      {type === "channel" && (
        <>
          <div className="h-2 bg-black"></div>
          <div className="mt-3 space-y-2 ">
            <p className="text-lightBlue px-3 text-sm">Members</p>

            {/* Subscribers */}

            <div
              className="px-3 py-2 flex items-start justify-between cursor-pointer hover:bg-white/5 transition-all duration-200"
              onClick={() => setter({ rightBarRoute: "/add-subscribers" })}
            >
              <span className="flex gap-5">
                <LuUsers className="size-5 pl-0.5 text-gray-400" />
                <span>Subscribers</span>
              </span>
              <span className="pr-2">{roomData.participants.length}</span>
            </div>

            {/* Administrators */}
            <div
              className="px-3 py-2 flex items-start justify-between cursor-pointer hover:bg-white/5 transition-all duration-200"
              onClick={() => setter({ rightBarRoute: "/administrators" })}
            >
              <span className="flex gap-5">
                <RiShieldStarLine className="size-5 text-gray-400" />
                <span>Administrators</span>
              </span>
              <span className="pr-2">{roomData.admins.length}</span>
            </div>
          </div>
          <div className="h-2 bg-black"></div>
        </>
      )}

      {type === "group" && (
        <>
          <div className="h-2 bg-black"></div>
          <div
            className="px-3 py-2 flex items-start gap-4 text-darkBlue cursor-pointer hover:bg-white/5 transition-all duration-200"
            onClick={() => setter({ rightBarRoute: "/add-members" })}
          >
            <FiUserPlus className="size-5 scale-x-[-1] " />
            <span>Add members</span>
          </div>
          <div className="h-2 bg-black"></div>
          <div className="border-t border-black/40">
            {isLoading ? (
              <div className="flex-center mt-10">
                <Loading size="lg" />
              </div>
            ) : (
              <div className="mt-3 space-y-2 ">
                <p className="text-lightBlue px-3">Members</p>
                <div className="flex flex-col mt-3 w-full overflow-y-scroll scroll-w-none">
                  {groupMembers?.length
                    ? groupMembers.map((member) => (
                        <RoomCard
                          key={member._id}
                          {...member}
                          myData={myData}
                          isOnline={isUserOnline(member._id)}
                        />
                      ))
                    : null}
                </div>
              </div>
            )}
          </div>
        </>
      )}
      {isViewerOpen && (
        <ProfileImageViewer
          imageUrl={avatar}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </>
  );
};

export default RoomDetails;
