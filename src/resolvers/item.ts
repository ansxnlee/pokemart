import { Item } from '../entities/Item';
import { Order } from '../entities/Order';
import { Product } from '../entities/Product';
import { MyContext } from "../types";
import { Query, Resolver, Ctx, Mutation, Int, Arg, ObjectType, Field } from "type-graphql";
import { FieldError } from '../util/FieldError';

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

  @Mutation(() => ItemResponse, { nullable: true })
  async addItem(
    @Arg('orderId', () => Int) orderId: number,
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

    // ORDER ID SHOULD BE TAKEN FROM REDIS CACHE INSTEAD OF ASKING FOR IT

    // find specified order that belongs to user
    const order = await em.findOneOrFail(Order, orderId);

    // find specified product via product id
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
  }
}