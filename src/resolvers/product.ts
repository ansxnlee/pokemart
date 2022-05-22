import { Product } from "../entities/Product";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import { wrap } from "@mikro-orm/core";

@Resolver()
export class ProductResolver {
  // get all products
  @Query(() => [Product])
  products(
    @Arg("category", { defaultValue: '' }) category: string,
    @Ctx() { em }: MyContext
  ): Promise<Product []> {
    if (!category) {
      return em.find(Product, {});
    }
    return em.find(Product, { category: category });
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
    @Arg('itemId', () => Int) itemId: number,
    @Arg('name', () => String) name: string,
    @Arg('nameEng', () => String) nameEng: string,
    @Arg('cost', () => Int) cost: number,
    @Arg('effect', () => String) effect: string,
    @Arg('text', () => String) text: string,
    @Arg('sprite', () => String) sprite: string,
    @Arg('category', () => String) category: string,
    @Ctx() { em }: MyContext
  ): Promise<Product> {
    // explicit transaction demarcation (begin, persist, rollback) in mikroORM
    await em.begin();
    const product = new Product(
      itemId, 
      name, 
      nameEng,
      cost,
      effect,
      text,
      sprite,
      category
    )
    try {
      em.persist(product);
      await em.commit();
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return product;
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
    const product = await em.findOneOrFail(Product, { id });
    // assign() seems to implicitly call the correct identity map?
    wrap(product).assign({
      name: name,
      cost: cost,
    });

    try {
      em.persist(product);
      await em.commit();
    } catch(e) {
      await em.rollback();
      throw e;
    }
    return product;
  }

  // delete product by id
  @Mutation(() => Boolean)
  async deleteProduct(
    @Arg('id', () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Boolean> {
    const product = await em.findOneOrFail(Product, { id });
    await em.remove(product).flush();
    return true;
  }
}
