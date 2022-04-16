import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import path from 'path';
import { __prod__ } from "./constant";

const config: Options<PostgreSqlDriver> = {
  migrations: {
    tableName: 'mikro_orm_migrations', // name of database table with log of executed transactions
    path: path.join(__dirname, '../migrations'), // path to the folder with migrations
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    disableForeignKeys: false
  },
  entities: [path.join(__dirname, '../dist/entities')], // no need for `entitiesTs` this way
  entitiesTs: [path.join(__dirname, './entities')], // path to our TS entities (src), relative to `baseDir`
  dbName: 'pokemartdb',
  type: 'postgresql', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
  user: 'pokemart',
  password: 'Pp2131',
  debug: !__prod__
};

export default config;
