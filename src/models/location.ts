import User from "./user";

export default interface Location {
  _id: string;
  x: number;
  y: number;
  sender: User;
  roomID: string;
  createdAt: string;
  updatedAt: string;
}
