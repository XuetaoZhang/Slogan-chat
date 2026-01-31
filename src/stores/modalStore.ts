import Message from "@/models/message";
import { create } from "zustand";

const defaultModalData = {
  isOpen: false,
  okText: "Yes",
  cancelText: "Cancel",
  title: "",
  bodyText: "",
  isCheckedText: "",
  isChecked: false,
  msgData: null,
  onSubmit: () => {},
  clickPosition: { x: 0, y: 0 },
};

interface Props {
  isOpen: boolean;
  title?: string;
  bodyText?: string;
  isChecked?: boolean;
  isCheckedText?: string;
  msgData:
    | (Message & {
        myId: string;
        addReplay: (_id: string) => void;
        edit: ((data: Message) => void) | ((_id: string) => void);

        pin: (_id: string) => void;
        isPv?: boolean;
      })
    | null;
  okText?: string;
  cancelText?: string;
  onSubmit: () => void;
  resetModal?: () => void;
  clickPosition: { x: number; y: number };
}

interface Updater {
  updater: (key: keyof Props, value: Props[keyof Props]) => void;
  setter: (state: Partial<Props> | ((prev: Props) => Partial<Props>)) => void;
}

const useModalStore = create<Props & Updater>((set) => ({
  ...defaultModalData,
  resetModal: () => set((prev) => ({ ...prev, ...defaultModalData })),

  updater(key: keyof Props, value: Props[keyof Props]) {
    set({ [key]: value });
  },

  setter: set,
}));

export default useModalStore;
