import { User } from "../entities/User";
import { MyContext } from "../types";
import { Arg, Mutation, Query, Resolver, Ctx, ObjectType, Field, Int } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME } from "../constant";
import { FieldError } from '../util/FieldError';

@ObjectType()
class UserResponse {
  // response will either be a user or an error
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {
  // show connected user
  @Query(() => User, {nullable: true})
  async conninfo(
    @Ctx() { req, em }: MyContext
  ) {
    // user is considered to be logged in if browser contains appropriate cookie
    if (!req.session.userId) {
      return null
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }


  // get all users
  @Query(() => [User])
  users(
    @Ctx() { em }: MyContext
  ): Promise<User []> {
    return em.find(User, {});
  }

  // get detailed info on user id
  @Query(() => User)
  async user(
    @Arg('username', () => String) username: string,
    @Ctx() { em }: MyContext
  ): Promise<User> {
    const user = await em.findOne(User, { username }, { populate: ['orders', 'orders.items'] });
    return user as User; // not sure why user value is null
  }

  // create a user
  @Mutation(() => UserResponse)
  async register(
    @Arg('username', () => String) username: string,
    @Arg('password', () => String) password: string,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    await em.begin();
    // server check for valid usernames
    if (username.length < 3) {
      return {
        errors: [
          {
            field: 'username',
            message: 'username is too short',
          },
        ],
      }
    }
    // server check for valid passwords
    if (password.length < 3) {
      return {
        errors: [
          {
            field: 'password',
            message: 'password is too short',
          },
        ],
      }
    }
    // plaintext password is never stored on database
    const hashedPassword = await argon2.hash(password)
    const user = new User(username, hashedPassword);
    try {
      em.persist(user);
      await em.commit();
    } catch(e) {
      await em.rollback();
      // this is a pretty hacky way to handle duplicate usernames
      if(e.code === "23505") {
        return {
          errors: [
            {
              field: 'username',
              message: 'username already exists',
            },
          ]
        }
      }
      throw e;
    }
    return { user };
  }

  // user login
  @Mutation(() => UserResponse)
  async login(
    @Arg('username', () => String) username: string,
    @Arg('password', () => String) password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    await em.begin();
    const user = await em.findOne(User, { username })
    // returned error can be shown on frontend
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "user does not exist",
          },
        ],
      };
    }
    const validPassword = await argon2.verify(user.password, password)
    if (!validPassword) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          },
        ],
      }
    }

    // @types/express-session: "1.17.x" removed the key string from "SessionData" interface
    // they want us to explicitly declare expected types for this the sessions obj
    // I manually adjusted interface to include it again as a hacky way to resolve this type error
    req.session.userId = user.id; // stores 'userId' object in redis so we can access later
    
    return { user };
  }

  // user logout
  @Mutation(() => Boolean)
  logout(
    @Ctx() { req, res }: MyContext
  ): Promise<Boolean> {
    return new Promise(resolve => req.session.destroy(err => {
      if (err) {
        console.log(err);
        resolve(false)
        return;
      }
      res.clearCookie(COOKIE_NAME);
      resolve(true)
    }));
  }

  // delete user by id
  @Mutation(() => Boolean)
  async eregister(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOneOrFail(User, id);
    await em.remove(user).flush();
    return { user };
  }
}