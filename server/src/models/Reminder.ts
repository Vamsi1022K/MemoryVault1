import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReminder extends Document {
  _id: Types.ObjectId;
  memoryId: Types.ObjectId;
  type: string; // "DATE" or "EXPIRY"
  reminderDate: Date;
  completed: boolean;
  userId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema = new Schema<IReminder>(
  {
    memoryId: { type: Schema.Types.ObjectId, ref: "Memory", required: true },
    type: { type: String, default: "DATE" },
    reminderDate: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ReminderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export default mongoose.model<IReminder>("Reminder", ReminderSchema);
