import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Item {
  constructor(name: string, cost: number, description: string) {
    this.name = name;
    this.cost = cost;
    this.description = description;
  }

  @PrimaryKey()
  id!: number;
  
  @Property({ type: 'date' })
  createdAt = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({ type: 'text' })
  name!: string;

  @Property({ type: 'integer' })
  cost!: number;
  
  @Property({ type: 'text' })
  description!: string;
}