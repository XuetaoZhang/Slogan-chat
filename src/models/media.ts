import User from "./user";

export default interface Media {
  _id: string;
  file: File;
  sender: User;
  roomID: string;
  createdAt: string;
  updatedAt: string;
}
