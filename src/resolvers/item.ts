import { Item } from '../entities/Item';
import { MyContext } from "../types";
import { Query, Resolver, Ctx } from "type-graphql";

@Resolver()
export class ItemResolver {
    // get all items
    @Query(() => [Item])
    items(
      @Ctx() { em }: MyContext
    ): Promise<Item []> {
      return em.find(Item, {});
    }
}