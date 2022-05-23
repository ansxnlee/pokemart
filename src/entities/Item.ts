import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Order } from "./Order";
import { Product } from "./Product";

@ObjectType()
@Entity()
export class Item {
  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => Order)
  @ManyToOne(() => Order, { onDelete: 'cascade' })
  order: Order;
  
  @Field(() => Product)
  @ManyToOne(() => Product, { onDelete: 'cascade' })
  product: Product;

  @Field()
  @Property({ type: 'integer' })
  quantity!: number;

  @Field(() => String)
  @Property({ type: 'date' })
  created = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updated = new Date();

  // i don't know how to cache composite key entities for urql queries so im dropping the use of composite keys
  
  // proper type checks in 'FilterQuery'??
  //[PrimaryKeyType]?: [number, number] 

  constructor(order: Order, product: Product, quantity: number) {
    this.order = order;
    this.product = product;
    this.quantity = quantity;
  }
}