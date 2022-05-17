import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Item } from "./Item";

@ObjectType()
@Entity()
export class Product {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({ type: 'text' })
  name!: string;

  @Field()
  @Property({ type: 'integer' })
  cost!: number;

  @Field(() => Item)
  @OneToMany(() => Item, (item: Item) => item.product, { cascade: [Cascade.ALL] })
  items = new Collection<Item>(this);

  @Field(() => String)
  @Property({ type: 'date' })
  created = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updated = new Date();

  constructor(name: string, cost: number) {
    this.name = name;
    this.cost = cost;
  }
}