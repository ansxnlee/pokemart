# pokemart

Backend for pokemart, a mock E-commerce web app. 

[Apollo](https://github.com/apollographql/apollo-server/tree/main/packages/apollo-server-express) is used with [Express](https://github.com/expressjs/express) for the API which listens for requests from the graphql client in the frontend. Graphql resolvers and entities are made with [type-graphql](https://github.com/MichalLytek/type-graphql).

[Mikro-orm](https://github.com/mikro-orm/mikro-orm) is used to generate the SQL for the database. Configuring mikro-orm.config.ts will be necessary to properly link the backend to one. 
