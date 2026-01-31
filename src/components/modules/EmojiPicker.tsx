import EmojiPickers, { Theme } from "emoji-picker-react";
import { CSSProperties, Suspense } from "react";
interface EmojiPickerProps {
  isEmojiOpen: boolean;
  handleEmojiClick: (e: { emoji: string }) => void;
  style?: CSSProperties;
}
const EmojiPicker = ({
  isEmojiOpen,
  handleEmojiClick,
  style,
}: EmojiPickerProps) => {
  return (
    <Suspense>
      <EmojiPickers
        open={isEmojiOpen}
        theme={Theme.DARK}
        height={260}
        width="100%"
        style={{
          backgroundColor: "#17212B",
          borderRadius: "0",
          transition: "all 75ms",
          ...style,
        }}
        previewConfig={{ showPreview: false }}
        searchDisabled
        lazyLoadEmojis
        onEmojiClick={handleEmojiClick}
      />
    </Suspense>
  );
};

export default EmojiPicker;
