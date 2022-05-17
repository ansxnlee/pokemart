import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { Item } from "./Item";
import { User } from "./User";

@ObjectType()
@Entity()
export class Order {
  @Field()
  @PrimaryKey()
  id!: number;
  
  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'cascade' })
  user: User;

  @Field(() => [Item])
  @OneToMany(() => Item, (item: Item) => item.order, { cascade: [Cascade.ALL] })
  items = new Collection<Item>(this);

  @Field(() => String)
  @Property({ type: 'date' })
  created = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updated = new Date();

  constructor(user: User) {
    this.user = user;
  }
}