import { Item } from '../entities/Item';
import { Order } from '../entities/Order';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { MyContext } from "../types";
import { Query, Resolver, Ctx, Mutation, Int, Arg, ObjectType, Field } from "type-graphql";
import { FieldError } from '../util/FieldError';
import { wrap } from "@mikro-orm/core";

@ObjectType()
class ItemResponse {
  // response will either be an item or an error
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => Item, {nullable: true})
  item?: Item;
}

@Resolver()
export class ItemResolver {
  // get all items
  @Query(() => [Item])
  items(
    @Ctx() { em }: MyContext
  ): Promise<Item []> {
    return em.find(Item, {});
  }

  // get all items from a specified order
  @Query(() => [Item])
  orderItems(
    @Arg('orderId', () => Int) orderId: number,
    @Ctx() { em }: MyContext
  ): Promise<Item []> {
    return em.find(Item, { order: orderId });
  }

  // add item to new or existing order
  @Mutation(() => ItemResponse, { nullable: true })
  async addItem(
    @Arg('productId', () => Int) productId: number,
    @Arg('quantity', () => Int) quantity: number,
    @Ctx() { em, req }: MyContext
  ): Promise<ItemResponse | undefined> {
    await em.begin();

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

    const user = await em.findOneOrFail(User, userId);

    // user has not started a new order yet so create one
    // this state should only occur after submiting an order and
    // no item has been added to the order yet
    if (user.isOrdering == false) {
      await em.begin();
      // logic here is identical to newOrder resolver
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

      await em.begin();
      // create new item to be added to order
      const product = await em.findOneOrFail(Product, productId);
      const item = new Item(order, product, quantity);
      try {
        em.persist(item);
        await em.commit();
      } catch(e) {
        await em.rollback();
        throw e;
      }
      return { item };

    } else if (user.isOrdering == true) {
      // order for user is in progress so we can just add the item
      await em.begin();
      const product = await em.findOneOrFail(Product, productId);
      const order = await em.findOneOrFail(Order, user.currentOrderId);
      const item = new Item(order, product, quantity);
      try {
        em.persist(item);
        await em.commit();
      } catch(e) {
        await em.rollback();
        throw e;
      }
      return { item };
    }
    // this return should never occur
    return;
  }

  // change quantity for item in order
  @Mutation(() => ItemResponse)
  async editItem(
    @Arg('productId', () => Int) productId: number,
    @Arg('quantity', () => Int) quantity: number,
    @Ctx() { em,  req }: MyContext
  ): Promise<ItemResponse> {
    await em.begin();
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

    const user = await em.findOneOrFail(User, userId);
    
    // gets the item and change quantity
    const item = await em.findOneOrFail(Item, {
      order: user.currentOrderId,
      product: productId
    });

    wrap(item).assign({
      quantity: quantity
    });

    try {
      em.persist(item);
      await em.commit()
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return { item };
  }

  // delete item from order by product id
  @Mutation(() => ItemResponse)
  async removeItem(
    @Arg('productId', () => Int) productId: number,
    @Ctx() { em,  req }: MyContext
  ): Promise<ItemResponse | Boolean> {
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
    const user = await em.findOneOrFail(User, userId);

    // get item to be removed
    const item = await em.findOneOrFail(Item, {
      order: user.currentOrderId,
      product: productId
    });
    await em.remove(item).flush();
    return true;
  }
}