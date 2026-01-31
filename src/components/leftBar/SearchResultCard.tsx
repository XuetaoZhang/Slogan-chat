import Room from "@/models/room";
import User from "@/models/user";
import useGlobalStore from "@/stores/globalStore";
import useUserStore from "@/stores/userStore";
import useSockets from "@/stores/useSockets";
import { scrollToMessage } from "@/utils";
import Image from "next/image";
import { FiBookmark } from "react-icons/fi";
import ProfileGradients from "../modules/ProfileGradients";

interface Props {
  myData: User;
  query: string;
}

const highlightChars = (query: string, name: string, lastName: string) => {
  const fullName = `${name} ${lastName}`;
  const lowerCaseQuery = query.toLowerCase();
  const lowerCaseFullName = fullName.toLowerCase();

  const isQueryIncludesInFullName = lowerCaseFullName.includes(lowerCaseQuery);
  const startToHighlightIndex = lowerCaseFullName.indexOf(lowerCaseQuery);
  const endToHighlightIndex = startToHighlightIndex + lowerCaseQuery.length - 1;

  return isQueryIncludesInFullName ? (
    fullName.split("").map((char, index) => {
      const isInHighlightRange =
        index >= startToHighlightIndex && index <= endToHighlightIndex;
      return (
        <span
          key={index}
          className={isInHighlightRange ? "text-lightBlue" : ""}
        >
          {char}
        </span>
      );
    })
  ) : (
    <span>{fullName}</span>
  );
};

const SearchResultCard = (
  roomData: Partial<Room & User & { findBy?: keyof Room }> & Props
) => {
  const {
    avatar,
    name,
    lastName = "",
    _id,
    myData,
    participants,
    type,
    findBy = null,
    query,
  } = roomData;
  const { isChatPageLoaded, onlineUsers, setter } = useGlobalStore(
    (state) => state
  );
  const { rooms, _id: myID } = useUserStore((state) => state);
  const roomSocket = useSockets((state) => state.rooms);

  const openChat = () => {
    const roomHistory = rooms.find(
      (data) =>
        data._id === _id || // For channel & groups
        data.name === myData._id + "-" + _id || // for private chats
        data.name === _id + "-" + myData._id // for private chats
    );

    const userRoom: Omit<Room, "_id" | "lastMsgData" | "notSeenCount"> = {
      admins: [myData._id, _id!],
      avatar: "",
      createdAt: Date.now().toString(),
      creator: myData._id,
      link: (Math.random() * 9999999).toString(),
      locations: [],
      medias: [],
      messages: [],
      name: myData._id + "-" + _id,
      participants: [myData, roomData] as User[],
      type: "private",
      updatedAt: Date.now().toString(),
    };

    if (roomHistory) {
      roomSocket?.emit("joining", roomHistory?._id);

      setTimeout(
        () => {
          if (roomData.messages?.length === 1)
            scrollToMessage(roomData.messages[0]._id);
        },
        isChatPageLoaded ? 1000 : 6000
      );
    } else {
      setter({ isRoomDetailsShown: false, selectedRoom: userRoom as Room });
      roomSocket?.emit("joining", _id);
    }
  };

  const openSavedMessages = () => {
    const savedMessageRoomID = rooms.find(
      (room) => room.type == "private" && room.participants.length == 1
    )?._id;
    roomSocket?.emit("joining", savedMessageRoomID);
  };

  const userID = (participants as User[])?.find(
    (user: User) => user.name === name
  )?._id;

  const isUserOnline = onlineUsers.some((data) => {
    if (data.userID === userID) return true;
  });

  const isSavedMessages =
    findBy === "messages" &&
    type === "private" &&
    participants?.length === 1 &&
    (participants as User[])[0]._id === myID;

  return (
    <div
      onClick={_id === myID ? openSavedMessages : openChat}
      className="flex items-center gap-2 cursor-pointer overflow-x-hidden border-b border-black/15 hover:bg-white/5 transition-all duration-200"
    >
      {_id === myID || isSavedMessages ? (
        <div
          className={`size-11 bg-cyan-700 shrink-0 rounded-full flex-center text-white text-2xl`}
        >
          <FiBookmark />
        </div>
      ) : avatar ? (
        <Image
          src={avatar}
          className="cursor-pointer object-cover size-11 rounded-full shrink-0"
          width={50}
          height={50}
          alt="avatar"
        />
      ) : (
        <ProfileGradients
          classNames="size-11 text-center text-lg"
          id={userID ?? ""}
        >
          {name ? name[0] : ""}
        </ProfileGradients>
      )}
      <div className="flex flex-col justify-between w-full py-2">
        <p className="text-base font-vazirBold line-clamp-1 text-ellipsis break-words">
          {findBy == "participants" || findBy == "name"
            ? highlightChars(query, name ? name : "", lastName ? lastName : "")
            : _id === myID
            ? "Saved messages"
            : name + " " + lastName}
        </p>

        <p className="text-sm text-darkGray line-clamp-1 text-ellipsis break-words">
          {findBy == "messages" && roomData.messages?.length ? (
            highlightChars(query, roomData.messages[0].message, "")
          ) : type === "group" ? (
            `${participants?.length} members`
          ) : type === "channel" ? (
            `${participants?.length} subscribers`
          ) : isUserOnline ? (
            <span className="text-lightBlue">online</span>
          ) : (
            "last seen recently"
          )}
        </p>
      </div>
    </div>
  );
};

export default SearchResultCard;
