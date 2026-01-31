import useUserStore from "@/stores/userStore";
import { useEffect, useRef, useState } from "react";
import ChatFolders from "./ChatFolders";

const folders = ["all", "private", "group", "channel", "bot"];

const RoomFolders = ({
  updateFilterBy,
}: {
  updateFilterBy: (filterBy: string) => void;
}) => {
  const [foldersCount, setFolderCount] = useState<
    Record<(typeof folders)[number], number>
  >({});
  const [activeFolder, setActiveFolder] = useState("all");
  const chatFolderRef = useRef<HTMLDivElement>(null);
  const { rooms, notSeenCounts } = useUserStore((state) => state);

  useEffect(() => {
    if (!rooms?.length) return;

    const newFolderCount: Record<string, number> = {};

    rooms.forEach((room) => {
      const count = notSeenCounts[room._id] || 0;

      newFolderCount[room.type] = (newFolderCount[room.type] ?? 0) + count;
      newFolderCount["all"] = (newFolderCount["all"] ?? 0) + count;
    });

    setFolderCount(newFolderCount);
  }, [rooms, notSeenCounts]);

  useEffect(() => {
    updateFilterBy(activeFolder);
  }, [activeFolder, updateFilterBy]);

  useEffect(() => {
    const handleScroll = (event: WheelEvent) => {
      event.preventDefault();
      const scrollAmount = event.deltaY < 0 ? -30 : 30;
      chatFolderRef.current!.scrollBy({ left: scrollAmount });
    };

    chatFolderRef.current!.addEventListener("wheel", handleScroll);
    return () =>
      // eslint-disable-next-line react-hooks/exhaustive-deps
      chatFolderRef.current?.removeEventListener("wheel", handleScroll);
  }, []);

  return (
    <div
      data-aos="zoom-in"
      ref={chatFolderRef}
      className="flex items-end pb-1  scroll-w-none gap-4 overflow-x-auto h-10 text-darkGray "
    >
      {folders.map((data) => (
        <ChatFolders
          key={data}
          count={foldersCount[data]}
          name={data}
          isActive={activeFolder == data}
          onClick={() => setActiveFolder(data)}
        />
      ))}
    </div>
  );
};

export default RoomFolders;
