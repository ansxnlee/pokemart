import 'reflect-metadata'; // typegraphql dependency (must be before importing typegraphql)
import { MikroORM } from "@mikro-orm/core"
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'; // or any other driver package
import { __prod__ } from "./constant"; // checks if we're in production
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

  // CORS config
  // const corsOption = {
  //   origin: "https://studio.apollographql.com",
  //   credentials: true
  // }

  // redis client setup 
  const session = require("express-session");
  let RedisStore = require("connect-redis")(session);
  // redis@v4
  const { createClient } = require("redis");
  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);

  // redis cookie settings
  app.use( 
    session({
      name: 'userCookieID',
      store: new RedisStore({ 
        client: redisClient,
        disableTouch: true, // dont refresh timer on each session interaction
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24, // cookie lasts a day
        sameSite: 'None', // csrf stuff
        secure: !__prod__, // might cause bugs(?) if this is true in dev
      },
      saveUninitialized: false,
      secret: "secret key change this later",
      resave: false,
    })
  );

  // apollo graphql setup
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, ItemResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em.fork(), req, res }),
  });
  
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: {credentials: true, origin: true} });

  const PORT = process.env.PORT || 4000

  app.listen(PORT, () => {
    console.log(`express server started on localhost:${PORT}`)
  })
}

main();
