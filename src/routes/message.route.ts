
import BaseRoute from "xhelpers-api/lib/base-route";
import { createPayload, updatePayload } from "./schemas/message.schemas";
import Service from "../services/message.service";

const httpResourcePath = "messages";
const httpResourceName = "Messages"

class Routes extends BaseRoute<Service> {
  constructor() {
    super(new Service(), [httpResourcePath]);

    this.route("GET",`/api/${httpResourcePath}`,{
        description: `Search '${httpResourceName}'`,
      },
      false
    )
      // .validate({ query: todoQueryParams })
      .handler(async (r, h, u) => {
        return h.response(
          await this.service.queryAll(u, { filter: {
            ...r.query,
            sentTo: u._id
          }, fields: ["-__v"] })
        ).code(200);
      })
      .build();

    this.route("GET", `/api/${httpResourcePath}/{id}`, {
        description: `Get '${httpResourceName}' by id`,
        id: `GET${httpResourceName}`
      },
      false
    )
      .handler(async (r, h, u) => {
        return h.response(
          await this.service.getById(u, r.params.id, [], {
            path: ".",
          })
        ).code(200);
      })
      .build();

    this.route("POST", `/api/${httpResourcePath}`, {
        description: `Create new '${httpResourceName}'`,
      },
      false
    )
      .validate({ payload: createPayload })
      .handler(async (r, h, u) => {
        const response = await this.service.create(u, r.payload);
        return h
          .response(response)
        .code(200);
      })
      .build();

    this.route("PATCH", `/api/${httpResourcePath}/{id}`, {
        description: `Update '${httpResourceName}' by id`,
      },
      false
    )
      .validate({ params: this.defaultIdProperty, payload: updatePayload })
      .handler(async (r, h, u) => {
        const response = await this.service.update(u, r.params.id, r.payload);
        return h
          .response(response)
          .code(200);
      })
      .build();

    this.route("DELETE", `/api/${httpResourcePath}/{id}`, {
        description: `Delete '${httpResourceName}' by id`,
      },
      false
    )
      .validate({ params: this.defaultIdProperty })
      .handler(async (r, h, u) => {
        await this.service.delete(u, r.params.id);
        return h
          .response({})
          .code(201);
      })
      .build();
  }
}

module.exports = [...new Routes().buildRoutes()];
