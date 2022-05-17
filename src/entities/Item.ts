import { Entity, ManyToOne, PrimaryKeyType, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Order } from "./Order";
import { Product } from "./Product";

@ObjectType()
@Entity()
export class Item {
  @Field(() => Order)
  @ManyToOne(() => Order, { primary: true, onDelete: 'cascade' })
  order: Order;
  
  @Field(() => Product)
  @ManyToOne(() => Product, { primary: true, onDelete: 'cascade' })
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

  [PrimaryKeyType]?: [number, number] // proper type checks in 'FilterQuery'??

  constructor(order: Order, product: Product, quantity: number) {
    this.order = order;
    this.product = product;
    this.quantity = quantity;
  }
}