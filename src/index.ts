// tslint:disable-next-line: no-var-requires
require("dotenv").config();

import { createServer } from "xhelpers-api/lib/server";
import * as Nes from "@hapi/nes";
// tslint:disable-next-line: no-var-requires
const pkgJson = require("../package.json");

export let server: any;
const options: any = {
  serverOptions: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "127.0.0.1",
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  },
  options: {
    jwt_secret: process.env.JWT_SECRET,
    swaggerOptions: {
      info: {
        title: pkgJson.name,
        version: pkgJson.version,
      },
      schemes: [process.env.SSL === "true" ? "https" : "http"],
      grouping: "tags",
    },
    routeOptions: {
      routes: "*/routes/*.js",
    },
    mongooseOptions: {
      uri: process.env.MONGODB_URI,
    },
  },
};

export async function getServer(){
  let serverAux: any = {};
  serverAux = await createServer(options);

  // register Nes
  await serverAux.register({
    plugin: Nes,
    options: {
      auth: {
        type: "token"
      }
    }
  });

  // subscription filter
  const subscriptionFilter = async (path, message, opt) => {
    if (!opt?.credentials?.user?._id) return false;
    if (!message?.sendTo) return false;
    return message.sendTo.indexOf(opt.credentials.user._id) !== -1;
  };

  // add subscriptions
  serverAux.subscription("/{channel}", {
    auth: false,
    filter: subscriptionFilter
  });
  serverAux.subscription("/{channel}/{subchannel}", {
    auth: false,
    filter: subscriptionFilter
  });
  serverAux.subscription("/{channel}/{subchannel}/{action}", {
    auth: false,
    filter: subscriptionFilter
  });

  return serverAux;
}

async function start() {
  server = await getServer();
  await server.start();
  return server;
}

if (typeof require !== "undefined" && require.main === module) {
  start();
}
