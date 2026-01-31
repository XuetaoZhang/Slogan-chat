import useUserStore from "@/stores/userStore";
import ContactCard from "../leftBar/ContactCard";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import User from "@/models/user";
import useGlobalStore from "@/stores/globalStore";
import useSockets from "@/stores/useSockets";
import Room from "@/models/room";

interface AddMembersProps {
  setCanSubmit: Dispatch<SetStateAction<boolean>>;
  submitChanges: boolean;
  setSubmitChanges: Dispatch<SetStateAction<boolean>>;
  roomData: User & Room;
}

const AddMembers = ({
  setCanSubmit,
  setSubmitChanges,
  submitChanges,
  roomData,
}: AddMembersProps) => {
  const { _id: myID, rooms } = useUserStore((state) => state);
  const { onlineUsers, selectedRoom, setter } = useGlobalStore(
    (state) => state
  );
  const socket = useSockets.getState().rooms;
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const updateSelectedUsers = (userID: string) => {
    const currentSelectedUsers = [...selectedUsers];

    if (currentSelectedUsers.includes(userID)) {
      const userTargetIndex = currentSelectedUsers.findIndex(
        (id) => id === userID
      );
      currentSelectedUsers.splice(userTargetIndex, 1); // splice instead of filter have a better performance here
      setSelectedUsers(currentSelectedUsers);
      return;
    }

    setSelectedUsers((prev) => [...prev, userID]);
  };

  const userContacts = rooms
    .filter((room) => room.type === "private" && room.participants.length > 1)
    ?.map((room) => ({
      ...room,
      participants: room.participants.filter((user) => {
        if (typeof user === "string") {
          return !roomData.participants.includes(user);
        } else {
          return !roomData.participants.includes(user._id);
        }
      }),
    }))
    .filter((room) => room.participants.length > 0);

  const filteredUserCards = useMemo(() => {
    return userContacts?.length
      ? [...userContacts].filter((data) =>
          (data.participants as User[])
            .find((pd) => pd._id !== myID)
            ?.name.toLocaleLowerCase()
            .includes(search.toLocaleLowerCase())
        )
      : [];
  }, [myID, search, userContacts]);

  const isUserOnline = (id: string) => {
    return onlineUsers.some((data) => {
      if (data.userID === id) return true;
    });
  };

  const submitMembers = useCallback(async () => {
    socket?.emit("updateRoomData", {
      roomID: selectedRoom?._id,
      participants: [...roomData?.participants, ...selectedUsers],
    });
    socket?.off("updateRoomData");
    socket?.once("updateRoomData", ({ _id, participants }) => {
      useUserStore.getState().setter((prev) => ({
        ...prev,
        rooms: prev.rooms?.map((room) =>
          room._id === _id ? { ...room, participants } : room
        ),
      }));
      useGlobalStore.getState().setter({
        selectedRoom: { ...selectedRoom!, participants },
      });
      setSubmitChanges(false);
      setter({ rightBarRoute: "/" });
    });
  }, [
    roomData?.participants,
    selectedRoom,
    selectedUsers,
    setSubmitChanges,
    setter,
    socket,
  ]);

  useEffect(() => {
    if (submitChanges) {
      submitMembers();
    }
    return () => {
      socket?.off("updateRoomData");
    };
  }, [socket, submitChanges, submitMembers]);

  useEffect(() => {
    if (selectedUsers.length) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [selectedUsers.length, setCanSubmit]);

  return (
    <>
      <input
        dir="auto"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-inherit p-1 w-full px-4 outline-hidden text-sm mt-1"
        placeholder={
          selectedRoom?.type === "group"
            ? "Who would you like to add?"
            : "Add people to your channel"
        }
      />

      <div className="px-1">
        <div className="flex flex-col mt-1 w-full">
          {filteredUserCards?.map((userData) => (
            <ContactCard
              key={userData._id}
              isUserOnline={isUserOnline(userData._id)}
              selectedUsers={selectedUsers}
              updateSelectedUsers={updateSelectedUsers}
              userData={userData}
              myID={myID}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AddMembers;
