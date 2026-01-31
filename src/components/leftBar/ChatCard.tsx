import { MdDone } from "react-icons/md";
import { IoCheckmarkDone } from "react-icons/io5";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Room from "@/models/room";
import Message from "@/models/message";
import useUserStore from "@/stores/userStore";
import useGlobalStore from "@/stores/globalStore";
import useSockets from "@/stores/useSockets";
import { formatDate } from "@/utils";
import { FiBookmark } from "react-icons/fi";
import { HiMiniUserGroup } from "react-icons/hi2";
import { HiSpeakerphone } from "react-icons/hi";
import ProfileGradients from "../modules/ProfileGradients";

declare global {
  interface Window {
    updateCount?: (roomTargetId: string) => void;
  }
}

interface User {
  _id: string;
  avatar?: string;
  name?: string;
  lastName?: string;
}

const ChatCard = ({
  _id,
  name: roomName,
  type,
  avatar: roomAvatar,
  lastMsgData: initialLastMsgData,
  notSeenCount: initialNotSeenCount,
  participants,
  createdAt,
}: Room) => {
  const [draftMessage, setDraftMessage] = useState(() => {
    return localStorage.getItem(_id) || "";
  });
  const [isActive, setIsActive] = useState<boolean>(false);
  const [lastMsgData, setLastMsgData] = useState<Message>(initialLastMsgData!);
  const { selectedRoom, onlineUsers, setter } = useGlobalStore(
    (state) => state
  );

  const {
    _id: myID,
    isInitialSet,
    notSeenCounts,
    setter: userSetter,
  } = useUserStore((state) => state) || {};
  const { rooms } = useSockets((state) => state);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isUser = (data: any): data is User => {
    return data && typeof data === "object" && "_id" in data;
  };

  const {
    avatar,
    name,
    lastName = "",
    _id: roomID,
  } = useMemo(() => {
    if (type === "private") {
      const participant = participants.find(
        (data) => isUser(data) && data?._id !== myID
      ) as User | undefined;

      if (participant) {
        return {
          name: participant.name,
          lastName: participant?.lastName,
          avatar: participant.avatar,
          _id: participant._id,
        };
      }
      // Fallback to current user if no other participant
      const currentUser = participants.find(
        (data) => isUser(data) && data?._id === myID
      ) as User | undefined;
      return {
        name: currentUser?.name || "Saved messages",
        avatar: currentUser?.avatar,
        _id: currentUser?._id || "",
      };
    }
    return { name: roomName, avatar: roomAvatar, _id };
  }, [_id, myID, participants, roomAvatar, roomName, type]);

  const isOnline = useMemo(
    () => onlineUsers.some((user) => user.userID === roomID),
    [onlineUsers, roomID]
  );

  const latestMessageTime =
    formatDate(lastMsgData?.createdAt) || formatDate(createdAt);
  const cardMessage =
    lastMsgData?.message || (lastMsgData?.voiceData ? "Voice message" : "");

  const joinToRoom = () => {
    setter({ rightBarRoute: "/" });
    setIsActive(true);
    rooms?.emit("joining", _id);
  };

  useEffect(() => {
    const handleUpdateLastMsgData = ({
      msgData,
      roomID: updatedRoomID,
    }: {
      msgData: Message;
      roomID: string;
    }) => {
      if (updatedRoomID === _id) {
        setLastMsgData(msgData);
      }
    };

    const handleSeenMsg = ({ roomID: seenRoomID }: { roomID: string }) => {
      if (seenRoomID === _id) {
        userSetter((prev) => ({
          notSeenCounts: {
            ...prev.notSeenCounts,
            [seenRoomID]: Math.max(
              (prev.notSeenCounts[seenRoomID] || 0) - 1,
              0
            ),
          },
        }));
      }
    };

    const handleNewMessage = ({
      roomID: newMsgRoomID,
      sender,
    }: {
      roomID: string;
      sender: string | { _id: string };
    }) => {
      if (
        newMsgRoomID === _id &&
        ((typeof sender === "string" && sender !== myID) ||
          (typeof sender === "object" && sender?._id !== myID))
      ) {
        userSetter((prev) => ({
          notSeenCounts: {
            ...prev.notSeenCounts,
            [newMsgRoomID]: (prev.notSeenCounts[newMsgRoomID] || 0) + 1,
          },
        }));
      }
    };

    setIsActive(selectedRoom?._id === _id);

    rooms?.on("updateLastMsgData", handleUpdateLastMsgData);
    rooms?.on("seenMsg", handleSeenMsg);
    rooms?.on("newMessage", handleNewMessage);

    return () => {
      rooms?.off("updateLastMsgData", handleUpdateLastMsgData);
      rooms?.off("seenMsg", handleSeenMsg);
      rooms?.off("newMessage", handleNewMessage);
    };
  }, [_id, myID, rooms, selectedRoom?._id, userSetter]);

  useEffect(() => {
    setDraftMessage(localStorage.getItem(_id) || "");
  }, [_id, selectedRoom?._id]);

  useEffect(() => {
    if (!isInitialSet) {
      userSetter((prev) => ({
        notSeenCounts: {
          ...prev.notSeenCounts,
          [_id]: initialNotSeenCount,
        },
        isInitialSet: true,
      }));
    }
  }, [_id, initialNotSeenCount, isInitialSet, userSetter]);

  return (
    <div
      onClick={joinToRoom}
      className={`w-full flex items-center gap-3 p-2.5 relative h-[4.5rem] border-b border-black/15 hover:bg-white/5 cursor-pointer transition-all duration-200 ${
        isActive && "bg-white/5"
      }`}
    >
      {roomID === myID ? (
        <div
          className={`size-11 bg-cyan-700 shrink-0 rounded-full flex-center text-white text-2xl`}
        >
          <FiBookmark />
        </div>
      ) : avatar ? (
        <Image
          className="size-11 bg-center object-cover rounded-full shrink-0"
          quality={100}
          width={50}
          height={50}
          src={avatar}
          alt="avatar"
        />
      ) : (
        <ProfileGradients classNames="size-11" id={roomID}>
          {name?.charAt(0)}
        </ProfileGradients>
      )}

      {type === "private" && isOnline && (
        <span
          className={`absolute bg-teal-500 transition-all duration-300  size-3 left-10 bottom-2.5 rounded-full border-2 border-black`}
        ></span>
      )}

      <div className="flex flex-col gap-1 text-darkGray text-sm w-[75%] truncate">
        <div className="flex items-center truncate">
          <div className="text-white flex items-start gap-0.5 text-base font-vazirBold truncate ">
            {type === "group" && (
              <HiMiniUserGroup className="mt-[0.17rem] min-w-fit" />
            )}
            {type === "channel" && (
              <HiSpeakerphone className="mt-[0.17rem] min-w-fit" />
            )}
            <span dir="auto" className="truncate">
              {roomID === myID ? "Saved messages" : name + " " + lastName}
            </span>
          </div>
          <div className="flex gap-1 items-center absolute right-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(lastMsgData?.sender as any) === myID ||
            lastMsgData?.sender._id === myID ? (
              <>
                {lastMsgData?.seen.length ||
                initialLastMsgData?.seen?.length ? (
                  <IoCheckmarkDone className="size-5 text-lightBlue mb-1" />
                ) : (
                  <MdDone className="size-5 text-lightBlue mb-1" />
                )}
              </>
            ) : null}
            <p className="whitespace-nowrap ">{latestMessageTime || null}</p>
          </div>
        </div>

        <div className="flex items-center justify-between ">
          <div className="line-clamp-1 ">
            {draftMessage ? (
              <span className="text-red-400 flex gap-1 ">
                Draft:
                <div className=" text-darkGray truncate">{draftMessage}</div>
              </span>
            ) : (
              <div className="truncate w-full ">{cardMessage}</div>
            )}
          </div>

          <div className="flex items-center gap-2 absolute right-3">
            {notSeenCounts[_id] > 0 && (
              <div
                data-aos="zoom-in"
                className="flex-center pt-1 size-5 bg-lightBlue text-black rounded-full text-xs font-vazirBold shrink-0"
              >
                {notSeenCounts[_id] > 99 ? "+99" : notSeenCounts[_id]}
              </div>
            )}

            {lastMsgData?.pinnedAt && (
              <Image
                key={lastMsgData.pinnedAt}
                src="/shapes/pin.svg"
                width={15}
                height={15}
                className="size-4 bg-center"
                alt="pin shape"
                priority
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatCard;
