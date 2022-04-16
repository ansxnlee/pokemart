import { MikroORM } from "@mikro-orm/core"
import type { PostgreSqlDriver } from '@mikro-orm/postgresql'; // or any other driver package
import { __prod__ } from "./constant"; // checks if we're in production
//import { Item } from "./entities/Item";
import mikroConfig from './mikro-orm.config';

const main = async () => {
  const orm = await MikroORM.init<PostgreSqlDriver>(mikroConfig);
  console.log(orm.em); // access EntityManager via `em` property

  // example of adding an entry to postgres with identity maps
  // const em = orm.em.fork();
  // await em.begin();
  // try {
  //   const item = new Item('Potion', 10, 'healing item');
  //   em.persist(item);
  //   await em.commit();
  // } catch(e) {
  //   await em.rollback();
  //   throw e;
  // }

}

main();
