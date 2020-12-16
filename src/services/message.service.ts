import Model, { IModel, IEvent, EEvent } from "../model/message"; // mongoose or sequelize "Model"
import BaseServiceMongoose from "xhelpers-api/lib/base-service-mongoose";
import AccountModel from "../model/account";
import ConversationModel from "../model/conversation";
import * as Boom from "@hapi/boom";
import { server } from "../index";

// mongoose
export default class Service extends BaseServiceMongoose<IModel> {
  protected sentitiveInfo: any = ["-__v"];
  constructor() {
    super(Model);
  }
  protected async validate(entity: IModel, payload: IModel, options?: { user: any }): Promise<boolean> {
    // validate if conversationId exists
    if (!payload.conversation) throw Boom.badRequest("conversation not found");
    if (options) {
      if (payload.conversation.participants.indexOf(options.user._id) === -1) throw Boom.badRequest("conversation not found");
    }
    return Promise.resolve(true);
  };

  protected async beforeCreate(u, payload) {
    const conversation = await ConversationModel.findById(payload.conversationId);
    payload.conversation = conversation;
    // set sentTo to participants of conversation
    payload.sentTo = conversation.participants;
    // set viewedBy with the user that created
    payload.viewedBy = [ u._id ];
    // create event that user sent message
    const event: IEvent = {
      name: EEvent.MESSAGE_SENT,
      value: u._id,
      raw: "",
      createdBy: u._id,
      createdAt: new Date()
    }
    payload.events = [ event ];
  }

  protected async afterCreate(u, payload, entity) {
    // set sendTo to send message
    payload.sendTo = payload.sentTo;
    // send to websocket
    await server.publish("/user/messages", payload);
  }

  public async create(u, payload) {
    await this.beforeCreate(u, payload);
    await this.validate(null, payload, { user: u });
    const entity = await super.create(u, payload);
    await this.afterCreate(u, payload, entity);
    return entity;
  }

  protected async getUser(userData) {
    let account;
    account = await AccountModel.findById(userData);
    if (!account) account = await AccountModel.findOne({ email: userData });
    return account;
  }

  public async getById(
    user: any,
    id: any,
    projection: any = [],
    populateOptions: { path: string | any; select?: string | any } = {
      path: ".",
      select: ["-__v"],
    }
  ) {
    const entity = await super.getById(user, id, projection, populateOptions);
    if(!entity || entity.sentTo.indexOf(user._id) === -1) throw Boom.notFound("not found");
    return entity;
  }
}
