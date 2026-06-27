import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMemory extends Document {
  _id: Types.ObjectId;
  name: string;
  location: string;
  notes?: string | null;
  photoUrl?: string | null;
  reminderDate?: Date | null;
  categoryId: Types.ObjectId;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MemorySchema = new Schema<IMemory>(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    notes: { type: String, default: null },
    photoUrl: { type: String, default: null },
    reminderDate: { type: Date, default: null },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

MemorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export default mongoose.model<IMemory>("Memory", MemorySchema);
