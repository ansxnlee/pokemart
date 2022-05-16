import { Product } from "../entities/Product";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { wrap } from "@mikro-orm/core";

@Resolver()
export class ProductResolver {
  // get all items
  @Query(() => [Product])
  items(
    @Ctx() { em }: MyContext
  ): Promise<Product []> {
    return em.find(Product, {});
  }

  // get item by id
  @Query(() => Product, { nullable: true })
  item(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Product | null> {
    return em.findOne(Product, { id });
  }

  @Mutation(() => Product)
  async createItem(
    @Arg('name', () => String) name: string,
    @Arg('cost', () => Int) cost: number,
    @Ctx() { em }: MyContext
  ): Promise<Product> {
    // explicit transaction demarcation (begin, persist, rollback) in mikroORM
    await em.begin();
    const item = new Product(name, cost)
    try {
      em.persist(item);
      await em.commit();
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return item;
  }

  @Mutation(() => Product)
  async updateItem(
    @Arg('id', () => Int) id: number,
    @Arg('name', () => String) name: string,
    @Arg('cost', () => Int) cost: number,
    @Ctx() { em }: MyContext
  ): Promise<Product> {
    await em.begin();
    const item = await em.findOneOrFail(Product, { id });
    // assign() seems to implicitly call the correct identity map?
    wrap(item).assign({
      name: name,
      cost: cost,
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
    const item = await em.findOneOrFail(Product, { id });
    await em.remove(item).flush();
    return true;
  }
}
