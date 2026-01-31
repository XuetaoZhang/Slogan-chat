import Message from "@/models/message";
import { useCallback, useRef } from "react";

interface useScrollMessageProps {
  messages: Message[] | undefined;
  myID: string;
  isLastMsgInView: boolean;
}
const useScrollMessage = ({
  messages,
  myID,
  isLastMsgInView,
}: useScrollMessageProps) => {
  const lastMsgRef = useRef<HTMLDivElement | null>(null);
  const prevMessagesLength = useRef(messages?.length ?? 0);

  const manageScroll = useCallback(() => {
    if (!messages) return;

    if (messages.length > prevMessagesLength.current) {
      const isFromMe =
        messages?.length && messages[messages.length - 1]?.sender?._id === myID;

      if (isFromMe || isLastMsgInView) {
        lastMsgRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
    prevMessagesLength.current = messages.length;
  }, [isLastMsgInView, messages, myID]);

  return { lastMsgRef, manageScroll };
};

export default useScrollMessage;
