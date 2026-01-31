import Room from "./room";

export default interface User {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  password: string;
  phone: string;
  rooms: Room[];
  avatar: string;
  biography: string;
  status: "online" | "offline";
  isLogin: boolean;
  roomMessageTrack: { roomId: string; scrollPos: number }[];
  createdAt: string;
  updatedAt: string;
}
