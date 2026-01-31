import mongoose, { Schema } from "mongoose";

const schema = new Schema(
  {
    file: { type: Buffer, required: true },
    sender: { type: Schema.ObjectId, ref: "User", required: true },
    roomID: { type: Schema.ObjectId, ref: "Room", required: true },
  },
  { timestamps: true }
);

const MediaSchema = mongoose.models.Media || mongoose.model("Media", schema);
export default MediaSchema;
