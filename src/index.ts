import 'reflect-metadata'; // typegraphql dependency (must be before importing typegraphql)
import { MikroORM } from "@mikro-orm/core"
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'; // or any other driver package
import { COOKIE_NAME, __prod__ } from "./constant"; // checks if we're in production
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { ItemResolver } from './resolvers/item';
import { UserResolver } from './resolvers/user';
import { MyContext } from './types';

const main = async () => {
  // mikroORM setup
  // access EntityManager via `em` property
  const orm = await MikroORM.init<PostgreSqlDriver>(mikroConfig);

  // express setup
  const app = express();

  // redis client setup 
  const session = require("express-session");
  let RedisStore = require("connect-redis")(session);
  // redis@v4
  const { createClient } = require("redis");
  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  // this is to get cookies to work with graphql studio in dev
  // make sure to add 'x-forwarded-proto' header with value 'https' in studio
  app.set('trust proxy', !__prod__);

  // redis cookie settings
  app.use( 
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ 
        client: redisClient,
        disableTouch: true, // dont refresh timer on each session interaction
      }),
      cookie: {
        maxAge: 1000 * 60 * 60, // cookie will last for one hour
        httpOnly: true,
        // 'none' is required for cookies to work from one site to another (might be bad in prod)
        sameSite: "none", // this setting is related to csrf 
        // setting to true makes requests come from a non HTTPS protocol for some reason
        secure: true, // might cause bugs(?) if this is true in dev
      },
      saveUninitialized: false,
      // cookie values are encrypted with this secret key
      secret: "secret key change this later",
      resave: false,
    })
  );

  // CORS config
  const corsOption = {
    origin: [
      "https://studio.apollographql.com",
      "http://localhost:3000",
    ],
    credentials: true
  }

  // apollo graphql setup
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, ItemResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em.fork(), req, res }),
  });
  
  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: corsOption });

  const PORT = process.env.PORT || 4000

  app.listen(PORT, () => {
    console.log(`express server started on localhost:${PORT}`)
  })
}

main();
