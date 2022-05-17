import { Order } from '../entities/Order';


import { MyContext } from "../types";
import { Query, Resolver, Ctx, Arg, Int, Mutation, Field, ObjectType } from "type-graphql";
import { FieldError } from '../util/FieldError';

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
    const order = new Order(userId);
    try {
      em.persist(order);
      await em.commit();
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return { order };
  }

}