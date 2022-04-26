import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class Item {
  constructor(name: string, cost: number, description: string) {
    this.name = name;
    this.cost = cost;
    this.description = description;
  }

  @Field()
  @PrimaryKey()
  id!: number;
  
  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({ type: 'text' })
  name!: string;

  @Field()
  @Property({ type: 'integer' })
  cost!: number;
  
  @Field()
  @Property({ type: 'text' })
  description!: string;
}