import Model, { IModel } from "../model/conversation"; // mongoose or sequelize "Model"
import BaseServiceMongoose from "xhelpers-api/lib/base-service-mongoose";
import AccountModel from "../model/account";
import * as Boom from "@hapi/boom";
import { server } from "../index";

// mongoose
export default class Service extends BaseServiceMongoose<IModel> {
  protected sentitiveInfo: any = ["-__v"];
  constructor() {
    super(Model);
  }
  protected async validate(entity: IModel, payload: IModel): Promise<boolean> {
    const invalid = false;
    if (invalid) throw new Error("Invalid payload.");
    return Promise.resolve(true);
  };

  protected async beforeCreate(u, payload) {
    // check if participants exist
    payload.participants = payload.participants.map(async it => (await this.getUser(it))._id);
    await Promise.all(payload.participants);
    payload.participants.push(u._id);
    payload.participants = [ ...new Set(payload.participants)];

    // set admin to be who created
    payload.admins = [ u._id ];
  }

  protected async afterCreate(u, payload, entity) {
    // create a system message on conversation
    await server.publish("/user/conversations", payload);
    return
  }

  public async create(u, payload) {
    await this.beforeCreate(u, payload);
    await this.validate(null, payload);
    const entity = await super.create(u, payload);
    await this.afterCreate(u, payload, entity);
    return entity;
  }

  protected async getUser(userData) {
    let account;
    account = await AccountModel.findById(userData);
    if (!account) account = await AccountModel.findOne({ email: userData });
    if (!account) throw Boom.badRequest(`user not found: ${userData}`);
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
    if(!entity || entity.participants.indexOf(user._id) === -1) throw Boom.notFound("not found");
    return entity;
  }
}
