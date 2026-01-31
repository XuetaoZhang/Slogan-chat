import { RoomModel, UserModel } from "@/@types/data.t";
import connectToDB from "@/db";
import MessageSchema from "@/schemas/messageSchema";
import RoomSchema from "@/schemas/roomSchema";
import UserSchema from "@/schemas/userSchema";

const escapeRegExp = (text: string) =>
  text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

export const POST = async (req: Request) => {
  try {
    await connectToDB();
    const { query } = await req.json();
    const { userID, payload: purePayload } = query;

    const payload = purePayload.toLowerCase();

    let result;

    if (payload.startsWith("@")) {
      const searchText = payload.slice(1).trim();

      if (searchText.length === 0) {
        return Response.json(null, { status: 404 });
      }

      result = await RoomSchema.findOne({
        link: { $regex: new RegExp(`^${escapeRegExp(payload)}$`, "i") },
      });
      if (result) return Response.json([result], { status: 200 });

      result = await UserSchema.find({
        username: {
          $regex: new RegExp(`^${escapeRegExp(searchText)}.*$`, "i"),
        },
      });

      if (result.length > 0) return Response.json(result, { status: 200 });

      return Response.json(null, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userRoomsData: any = await RoomSchema.find({
      participants: { $in: userID },
    })
      .lean()
      .then((rooms) =>
        Promise.all(
          rooms.map((room) =>
            RoomSchema.populate(room, [
              { path: "messages", model: MessageSchema },
              { path: "participants" },
            ])
          )
        )
      );

    const searchResult: (
      | RoomModel
      | (UserModel & { findBy: keyof RoomModel })
    )[] = [];

    userRoomsData.forEach(
      (roomData: RoomModel & { findBy: keyof RoomModel }) => {
        if (
          roomData.type !== "private" &&
          roomData.name.toLowerCase().includes(payload)
        ) {
          searchResult.push({ ...roomData, findBy: "name" });
        }

        if (roomData.type === "private") {
          const otherParticipant = roomData.participants.find(
            (data: UserModel) => data._id.toString() !== userID.toString()
          );

          if (
            otherParticipant &&
            otherParticipant.name.toLowerCase().includes(payload)
          ) {
            searchResult.push({
              ...roomData,
              findBy: "participants",
              name: otherParticipant.name,
              lastName: otherParticipant.lastName,
              avatar: otherParticipant.avatar,
            });
          }
        }

        roomData.messages.forEach((msgData) => {
          const isMsgDeletedForUser = msgData.hideFor.some(
            (id) => id.toString() === userID.toString()
          );

          if (
            !isMsgDeletedForUser &&
            msgData.message.toLowerCase().includes(payload)
          ) {
            const otherParticipant = roomData.participants.find(
              (data: UserModel) => data._id.toString() !== userID.toString()
            );
            const isMe = roomData.participants.find(
              (data: UserModel) => data._id.toString() === userID.toString()
            );

            searchResult.push({
              ...roomData,
              findBy: "messages",
              messages: [msgData],
              name:
                roomData.type === "private"
                  ? otherParticipant?.name
                    ? otherParticipant?.name
                    : isMe
                    ? "Saved messages"
                    : ""
                  : roomData.name,
              lastName:
                roomData.type === "private"
                  ? otherParticipant?.lastName ?? ""
                  : "",
              avatar:
                roomData.type === "private"
                  ? otherParticipant?.avatar ?? ""
                  : roomData.avatar,
            });
          }
        });
      }
    );

    return Response.json(searchResult, { status: 200 });
  } catch (err) {
    console.log(err);
    return Response.json(
      { message: "Unknown error, try later." },
      { status: 500 }
    );
  }
};
