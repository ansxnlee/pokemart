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
  @Property({ type: 'integer' })
  itemId!: number;

  @Field()
  @Property({ type: 'text' })
  name!: string;

  @Field()
  @Property({ type: 'text' })
  nameEng!: string;

  @Field()
  @Property({ type: 'integer' })
  cost!: number;

  @Field()
  @Property({ type: 'text' })
  effect!: string;

  @Field()
  @Property({ type: 'text' })
  text!: string;

  @Field()
  @Property({ type: 'text' })
  sprite!: string;

  @Field()
  @Property({ type: 'text' })
  category!: string;

  @Field(() => Item)
  @OneToMany(() => Item, (item: Item) => item.product, { cascade: [Cascade.ALL] })
  items = new Collection<Item>(this);

  @Field(() => String)
  @Property({ type: 'date' })
  created = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updated = new Date();

  constructor(
    itemId: number,
    name: string, 
    nameEng: string,
    cost: number,
    effect: string,
    text: string,
    sprite: string,
    category: string
  ) {
    this.itemId = itemId;
    this.name = name;
    this.nameEng = nameEng;
    this.cost = cost;
    this.effect = effect;
    this.text = text;
    this.sprite = sprite;
    this.category = category;
  }
}