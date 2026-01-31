import Location from "./location";
import Media from "./media";
import Message from "./message";
import User from "./user";

export default interface Room {
  _id: string;
  name: string;
  avatar: string;
  participants: (string | User)[];
  admins: string[];
  type: "group" | "private" | "channel";
  creator: string;
  messages: Message[];
  lastMsgData: Message | null;
  locations: Location[];
  medias: Media[];
  notSeenCount: number;
  link: string;
  createdAt: string;
  updatedAt: string;
}
