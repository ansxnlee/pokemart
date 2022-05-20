import { Order } from '../entities/Order';
import { User } from '../entities/User';

import { MyContext } from "../types";
import { Query, Resolver, Ctx, Arg, Int, Mutation, Field, ObjectType } from "type-graphql";
import { FieldError } from '../util/FieldError';
import { wrap } from "@mikro-orm/core";

@ObjectType()
class OrderResponse {
  // response will either be an item or an error
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => Order, {nullable: true})
  order?: Order;
}

@Resolver()
export class OrderResolver {
  // get list of all orders
  @Query(() => [Order])
  orders(
    @Ctx() { em }: MyContext
  ): Promise<Order []> {
    return em.find(Order, {});
  }

  // get specific order by id
  @Query(() => Order)
  async order(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Order> {
    const order = await em.findOne(
      Order, 
      { id }, 
      { populate: ['items', 'user', 'items.product'] }
    );
    return order as Order;
  }

  // this resolver is never called in the app and is only used for testing
  @Mutation(() => OrderResponse)
  async newOrder(
    @Ctx() { em, req }: MyContext
  ): Promise<OrderResponse> {
    await em.begin()
    const userId = req.session.userId; // find user in redis cache or null

    // check if user is logged
    if (!userId) {
      return {
        errors: [
          {
            field: 'user',
            message: 'you must be logged to add items'
          },
        ]
      }
    }

    // create new order object attached to logged user
    const order = new Order(userId);
    try {
      em.persist(order);
      await em.commit();
    } catch(e) {
      await em.rollback();
      throw e;
    }

    await em.begin();
    // change user 'isOrdering' status to true and set currentOrderId
    const user = await em.findOneOrFail(User, userId);
    wrap(user).assign({
      isOrdering: true,
      currentOrderId: order.id,
    });

    try {
      em.persist(user);
      await em.commit()
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return { order };
  }

  // finialize order and prevents any new changes to it
  @Mutation(() => Boolean)
  async submitOrder(
    @Ctx() { em, req }: MyContext
  ): Promise<Boolean> {
    await em.begin();
    const userId = req.session.userId; // find user in redis cache or null

    // check if user is logged
    if (!userId) {
      return false;
    }

    const user = await em.findOneOrFail(User, userId);

    // check that user is allowed to order and that order is not empty
    // note that submitting when the user doesn't have an order is
    // the same state as having an empty order
    if(!user.isOrdering || !user.orders) {
      throw "cant submit empty order";
    }

    // set user isOrdering status to false to allow for a new order
    wrap(user).assign({
      isOrdering: false,
    });

    try {
      em.persist(user);
      await em.commit()
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return true;
  }

  // delete order by id
  @Mutation(() => Boolean)
  async removeOrder(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    const order = await em.findOneOrFail(Order, { id });
    await em.remove(order).flush();
    return true;
  }
}