import * as mongoose from "mongoose";
import { IModel as IConversation } from "./conversation";

export interface IFile {
  filename: string;
  bucket: string;
}

export interface IEvent {
  name: string;
  value: string;
  raw: any;
  createdBy: string;
  createdAt: Date;
}

export enum EEvent {
  MESSAGE_SENT = "MESSAGE_SENT"
}

export interface IModel extends mongoose.Document {
  attachments: IFile[];
  text: string;
  conversationId: string;
  replyTo: string;
  sentTo: string[];
  viewedBy: string[];
  events: IEvent[];
  conversation: IConversation

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

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true },
  raw: { type: Object },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
})

const schema = new mongoose.Schema({
  attachments: [ fileSchema ],
  text: { type: String, required: true },
  conversationId: { type: String, required: true },
  replyTo: { type: String },
  viewedBy: [{ type: String }],
  sentTo: [{ type: String }],
  events: [ eventSchema ],

  // auto
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  metadata: { type: Object },
});

schema.set("toJSON", { virtuals: true });

export default mongoose.models.Message || mongoose.model<IModel>("Message", schema, "message");
