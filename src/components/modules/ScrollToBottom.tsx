import { useEffect, useRef } from "react";
import { FaAngleDown } from "react-icons/fa6";

interface Props {
  scrollToBottom: () => void;
  count: number;
}

const ScrollToBottom = ({ scrollToBottom, count }: Props) => {
  const notSeenCount = useRef<number>(count);

  useEffect(() => {
    notSeenCount.current = count;
  }, [count]);

  return (
    notSeenCount.current > 0 && (
      <div
        onClick={() => {
          notSeenCount.current = 0;
          scrollToBottom();
        }}
        className={`absolute ${
          notSeenCount ? "right-1.5" : "-right-12"
        } bottom-25 transition-all duration-300 size-10 bg-[#2E323F]  cursor-pointer rounded-full flex items-center justify-center`}
      >
        <FaAngleDown className="size-5" />
        <span className="absolute flex-center -top-2.5 bg-darkBlue text-xs rounded-full size-6">
          {notSeenCount.current}
        </span>
      </div>
    )
  );
};

export default ScrollToBottom;
