import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

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