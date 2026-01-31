import {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Message from "@/models/message";
import { scrollToMessage } from "@/utils";
import { TiPinOutline } from "react-icons/ti";

interface PinnedMessagesProps {
  pinnedMessages: Message[];
  messageContainerRef: RefObject<HTMLDivElement | null>;
}

const PinnedMessages: React.FC<PinnedMessagesProps> = ({
  pinnedMessages: messages,
  messageContainerRef,
}) => {
  const [activePinMsg, setActivePinMsg] = useState(0);
  const ticking = useRef(false);
  // Sort pinned messages in order by createAt
  const pinMessages = useMemo(() => {
    return messages
      .filter((msg) => msg.pinnedAt)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [messages]);

  // Ensuring that the active index is valid
  useEffect(() => {
    if (activePinMsg >= pinMessages.length) {
      setActivePinMsg(0);
    }
  }, [activePinMsg, pinMessages.length]);

  // Update the active message index on click: If there is still a next (older) message, we increment the index by one.
  const updateActivePinMsgIndex = useCallback(() => {
    setActivePinMsg((prev) =>
      prev < pinMessages.length - 1 ? prev + 1 : prev
    );
  }, [pinMessages.length]);

  // Scroll to active pinned message and update index
  const scrollToPinMessage = useCallback(() => {
    if (!pinMessages.length) return;
    ticking.current = true;

    const targetId = pinMessages[activePinMsg]?._id;
    if (targetId) {
      scrollToMessage(targetId, "smooth", "start");
      updateActivePinMsgIndex();

      setTimeout(() => {
        ticking.current = false;
      }, 1000);
    }
  }, [activePinMsg, pinMessages, updateActivePinMsgIndex]);

  // Calculate active pinned message based on user scroll and visible pinned message
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          let newActiveIndex = activePinMsg;
          for (let i = 0; i < pinMessages.length; i++) {
            const messageElem = document.getElementsByClassName(
              pinMessages[i]._id
            )[0];
            if (messageElem) {
              const rect = messageElem.getBoundingClientRect();
              const containerRect = container.getBoundingClientRect();

              if (
                rect.top >= containerRect.top &&
                rect.top < containerRect.bottom
              ) {
                newActiveIndex = i;
                break;
              }
            }
          }
          if (newActiveIndex !== activePinMsg) {
            setActivePinMsg(newActiveIndex);
          }
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [messageContainerRef, pinMessages, activePinMsg]);

  if (!pinMessages.length) return null;

  const activeMessage = pinMessages[activePinMsg];

  return (
    <div
      data-aos="slide-down"
      data-aos-duration="400"
      id="pinMessagesContainer"
      className="sticky top-0 py-1 px-2 h-12 bg-leftBarBg w-full z-10"
    >
      <div className="flex items-center justify-between relative cursor-pointer gap-2 w-full">
        <div
          onClick={scrollToPinMessage}
          className="w-full pl-2 border-l-3 border-darkBlue flex flex-col items-start"
        >
          <h5 className="font-bold font-vazirBold text-sm text-lightBlue">
            Pin messages
          </h5>
          <div className="flex gap-1 h-fit w-[95%] text-darkGray text-sm">
            <span className="text-lightBlue/70">
              {activeMessage?.sender.name}:
            </span>
            <div className="truncate">
              {activeMessage?.message ||
                (activeMessage?.voiceData && "Voice Message")}
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 flex items-center justify-center">
          <TiPinOutline className="text-darkGray" size={20} />
        </div>
      </div>
    </div>
  );
};

export default PinnedMessages;
