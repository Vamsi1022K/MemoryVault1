import mongoose, { Schema, Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  isCustom: boolean;
  userId: Types.ObjectId | null; // null = system default category
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true },
    isCustom: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Compound index: category name must be unique per user (or system-wide for defaults)
CategorySchema.index({ name: 1, userId: 1 }, { unique: true });

CategorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export default mongoose.model<ICategory>("Category", CategorySchema);
