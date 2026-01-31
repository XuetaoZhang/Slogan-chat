import Room from "./room";

export default interface NameSpace {
  _id: string;
  title: string;
  rooms: Room[];
  createdAt: string;
  updatedAt: string;
}
