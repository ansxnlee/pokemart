import { Product } from "../entities/Product";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { wrap } from "@mikro-orm/core";

@Resolver()
export class ProductResolver {
  // get all products
  @Query(() => [Product])
  products(
    @Ctx() { em }: MyContext
  ): Promise<Product []> {
    return em.find(Product, {});
  }

  // get product by id
  @Query(() => Product, { nullable: true })
  product(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Product | null> {
    return em.findOne(Product, { id });
  }

  // create product
  @Mutation(() => Product)
  async importProduct(
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

  // update product by id
  @Mutation(() => Product)
  async updateProduct(
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

  // delete product by id
  @Mutation(() => Boolean)
  async deleteProduct(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    const item = await em.findOneOrFail(Product, { id });
    await em.remove(item).flush();
    return true;
  }
}
