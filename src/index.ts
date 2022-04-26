import 'reflect-metadata'; // typegraphql dependency (must be before importing typegraphql)
import { MikroORM } from "@mikro-orm/core"
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'; // or any other driver package
import { __prod__ } from "./constant"; // checks if we're in production
//import { Item } from "./entities/Item";
import mikroConfig from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { ItemResolver } from './resolvers/item';

const main = async () => {
  // mikroORM setup
  const orm = await MikroORM.init<PostgreSqlDriver>(mikroConfig);
  console.log(orm.em); // access EntityManager via `em` property

  // express and apollo setup
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, ItemResolver],
      validate: false
    }),
    context: () => ({ em: orm.em.fork() })
  });
  
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log("express server started on localhost:4000")
  })

}

main();
