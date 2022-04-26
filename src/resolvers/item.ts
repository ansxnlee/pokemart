import { Item } from "../entities/Item";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { wrap } from "@mikro-orm/core";

@Resolver()
export class ItemResolver {
  // get all items
  @Query(() => [Item])
  items(
    @Ctx() { em }: MyContext
  ): Promise<Item []> {
    return em.find(Item, {});
  }

  // get item by id
  @Query(() => Item, { nullable: true })
  item(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Item | null> {
    return em.findOne(Item, { id });
  }

  @Mutation(() => Item)
  async createItem(
    @Arg('name', () => String) name: string,
    @Arg('cost', () => Int) cost: number,
    @Arg('description', () => String) description: string,
    @Ctx() { em }: MyContext
  ): Promise<Item> {
    // explicit transaction demarcation (begin, persist, rollback) in mikroORM
    await em.begin();
    const item = new Item(name, cost, description)
    try {
      em.persist(item);
      await em.commit();
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return item;
  }

  @Mutation(() => Item)
  async updateItem(
    @Arg('id', () => Int) id: number,
    @Arg('name', () => String) name: string,
    @Arg('cost', () => Int) cost: number,
    @Arg('description', () => String) description: string,
    @Ctx() { em }: MyContext
  ): Promise<Item> {
    await em.begin();
    const item = await em.findOneOrFail(Item, { id });
    // assign() seems to implicitly call the correct identity map?
    wrap(item).assign({
      name: name,
      cost: cost,
      description: description
    });

    try {
      em.persist(item);
      await em.commit();
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return item;
  }

  @Mutation(() => Boolean)
  async deleteItem(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    const item = await em.findOneOrFail(Item, { id });
    await em.remove(item).flush();
    return true;
  }
}
