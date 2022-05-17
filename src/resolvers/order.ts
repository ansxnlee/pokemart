import { Order } from '../entities/Order';

import { MyContext } from "../types";
import { Query, Resolver, Ctx } from "type-graphql";


@Resolver()
export class OrderResolver {
  // get list of all orders
  @Query(() => [Order])
  orders(
    @Ctx() { em }: MyContext
  ): Promise<Order []> {
    return em.find(Order, {});

  }



}