import * as mongoose from "mongoose";

export interface IFile {
  filename: string;
  bucket: string;
}

export interface IModel extends mongoose.Document {
  participants: string[];
  imageFile: IFile;
  title: string;
  admins: string[];
  pinned: boolean;

  // auto
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: any;
}

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  bucket: { type: String, required: true },
})

const schema = new mongoose.Schema({
  participants: [{ type: String }],
  imageFile: fileSchema,
  title: { type: String },
  admins: [{ type: String }],
  pinned: { type: Boolean, default: false },

  // auto
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  metadata: { type: Object },
});

schema.set("toJSON", { virtuals: true });

export default mongoose.models.Conversation || mongoose.model<IModel>("Conversation", schema, "conversation");
