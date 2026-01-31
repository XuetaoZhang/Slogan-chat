import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  title: { type: String, required: true },
  rooms: [{ type: Schema.ObjectId, ref: "Room", required: true }],
});

const NameSpaceSchema =
  mongoose.models.NameSpace || mongoose.model("NameSpace", schema);
export default NameSpaceSchema;
