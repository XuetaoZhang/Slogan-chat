import Room from "@/models/room";
import User from "@/models/user";
import useGlobalStore from "@/stores/globalStore";
import useUserStore from "@/stores/userStore";
import useSockets from "@/stores/useSockets";
import Image from "next/image";
import { PiDotsThreeVerticalBold } from "react-icons/pi";
import DropDown from "../modules/ui/DropDown";
import { Dispatch, SetStateAction, useState } from "react";
import { RiShieldStarLine } from "react-icons/ri";
import { GoNoEntry } from "react-icons/go";
import { LuUserMinus } from "react-icons/lu";
import ProfileGradients from "../modules/ProfileGradients";

interface Props {
  isOnline?: boolean;
  myData: User;
  shouldOpenChat?: boolean;
  setSubscribers?: Dispatch<SetStateAction<User[]>>;
}
const RoomCard = (roomData: Partial<User | Room> & Props) => {
  const {
    avatar = "",
    name = "",
    lastName = "",
    _id,
    isOnline,
    myData,
    shouldOpenChat = false,
    setSubscribers,
  } = roomData as User & Props;
  const { setter, selectedRoom, rightBarRoute } = useGlobalStore(
    (state) => state
  );
  const { rooms, _id: myID } = useUserStore((state) => state);
  const roomSocket = useSockets((state) => state.rooms);
  const [showUserOptions, setShowUserOptions] = useState(false);

  const showProfile = () => {
    setter({
      RoomDetailsData: roomData as Room,
      rightBarRoute: "/",
    });
  };

  const openChat = () => {
    setter({ rightBarRoute: "/" });
    const roomHistory = rooms.find(
      (data) =>
        data._id === _id || // For channel & groups
        data.name === myData._id + "-" + _id || // for private chats
        data.name === _id + "-" + myData._id // for private chats
    );

    const selectedRoom: Omit<Room, "_id" | "lastMsgData" | "notSeenCount"> = {
      admins: [myData._id, _id!],
      avatar: avatar!,
      createdAt: Date.now().toString(),
      creator: myData._id,
      link: (Math.random() * 9999999).toString(),
      locations: [],
      medias: [],
      messages: [],
      name: myData._id + "-" + _id,
      participants: [myData, roomData] as string[] | User[],
      type: "private",
      updatedAt: Date.now().toString(),
    };

    roomSocket?.emit(
      "joining",
      roomHistory?._id || roomData?._id,
      selectedRoom
    );

    setter({ isRoomDetailsShown: false, selectedRoom: selectedRoom as Room });
  };

  const isAdmin = selectedRoom?.admins.includes(_id);
  const isOwner = selectedRoom?.creator.includes(_id);
  const roomID = selectedRoom?._id;

  const dropDownItems = [
    !isAdmin && {
      title: "Promote to admin",
      icon: <RiShieldStarLine className="size-5 text-gray-400" />,

      onClick: () => {
        const socket = useSockets.getState().rooms;

        if (selectedRoom?.admins) {
          socket?.emit("updateRoomData", {
            roomID: roomID,
            admins: [...selectedRoom?.admins, _id],
          });
        }
        socket?.off("updateRoomData");
        socket?.once("updateRoomData", ({ _id, admins }) => {
          useUserStore.getState().setter((prev) => ({
            ...prev,
            rooms: prev.rooms.map((room) =>
              room._id === _id ? { ...room, admins } : room
            ),
          }));
          useGlobalStore.getState().setter({
            selectedRoom: { ...selectedRoom!, admins },
          });
        });
        setShowUserOptions(false);
      },
    },
    isAdmin && {
      title: "Dismiss admin",
      icon: <GoNoEntry className="size-5 text-red-400" />,
      itemClassNames: "text-red-400",
      onClick: () => {
        const socket = useSockets.getState().rooms;

        if (selectedRoom?.admins) {
          socket?.emit("updateRoomData", {
            roomID: roomID,
            admins: selectedRoom?.admins.filter((admin) => admin !== _id),
          });
        }
        socket?.off("updateRoomData");
        socket?.once("updateRoomData", ({ _id, admins }) => {
          useUserStore.getState().setter((prev) => ({
            ...prev,
            rooms: prev.rooms.map((room) =>
              room._id === _id ? { ...room, admins } : room
            ),
          }));
          useGlobalStore.getState().setter({
            selectedRoom: { ...selectedRoom!, admins },
          });
        });
        setShowUserOptions(false);
      },
    },
    {
      title: `Remove from ${
        rightBarRoute === "/edit-info" ? "group" : "channel"
      }`,
      icon: <LuUserMinus className="size-5 text-red-400" />,
      itemClassNames: "text-red-400",
      onClick: () => {
        const socket = useSockets.getState().rooms;

        if (selectedRoom?.admins) {
          socket?.emit("updateRoomData", {
            roomID: roomID,
            participants: selectedRoom?.participants.filter(
              (participant) => participant !== _id
            ),
            admins: selectedRoom?.admins.filter((admin) => admin !== _id),
          });
        }
        socket?.off("updateRoomData");
        socket?.once("updateRoomData", ({ _id, participants, admins }) => {
          useUserStore.getState().setter((prev) => ({
            ...prev,
            rooms: prev.rooms.map((room) =>
              room._id === _id ? { ...room, participants, admins } : room
            ),
          }));
          useGlobalStore.getState().setter({
            selectedRoom: { ...selectedRoom!, participants, admins },
          });
          socket?.emit("getRoomMembers", { roomID });
          socket?.once("getRoomMembers", (participants) => {
            if (setSubscribers) {
              setSubscribers(participants);
            }
          });
        });

        setShowUserOptions(false);
      },
    },
  ]
    .map((item) => item || null)
    .filter((item) => item !== null);

  return (
    <div className="flex items-center justify-between">
      <div
        onClick={shouldOpenChat ? openChat : showProfile}
        className="flex items-center gap-2 px-2 cursor-pointer border-b border-black/15 hover:bg-white/5 transition-all duration-200 grow"
      >
        {avatar ? (
          <Image
            src={avatar}
            className="cursor-pointer object-cover size-11 rounded-full"
            width={44}
            height={44}
            alt="avatar"
          />
        ) : (
          <ProfileGradients classNames="size-11 text-center text-lg " id={_id}>
            {name![0]}
          </ProfileGradients>
        )}

        <div className="flex flex-col justify-between  w-full py-2">
          <div className="flex items-center justify-between">
            <p className="text-base font-vazirBold line-clamp-1 text-ellipsis grow">
              <span className="flex items-center justify-between ">
                <span>{name + " " + lastName}</span>
                {isAdmin && !isOwner && (
                  <span className="text-xs text-darkBlue mb-0.5 font-vazirRegular">
                    Admin
                  </span>
                )}
              </span>
            </p>
            {isOwner && <p className="text-xs text-darkBlue">Owner</p>}
          </div>

          <p className="text-sm text-darkGray">
            {isOnline ? (
              <span className="text-lightBlue">Online</span>
            ) : (
              "last seen recently"
            )}
          </p>
        </div>
      </div>
      {(rightBarRoute === "/add-subscribers" ||
        rightBarRoute === "/edit-info" ||
        rightBarRoute === "/administrators") &&
        !isOwner &&
        _id !== myID && (
          <div>
            <DropDown
              button={
                <PiDotsThreeVerticalBold
                  onClick={() => setShowUserOptions(true)}
                  size={25}
                  className="w-fit cursor-pointer mr-2 hover:bg-white/10 transition-all duration-200 rounded-2xl p-1"
                />
              }
              dropDownItems={dropDownItems}
              isOpen={showUserOptions}
              setIsOpen={setShowUserOptions}
              classNames=" top-5 right-0 w-fit text-nowrap pr-2"
            />
          </div>
        )}
    </div>
  );
};

export default RoomCard;
