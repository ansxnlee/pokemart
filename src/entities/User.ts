import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
  
  @Field()
  @PrimaryKey()
  id!: number;
  
  @Field()
  @Property({ type: 'text', unique: true })
  username!: string;
  
  @Property({ type: 'text' })
  password!: string;

  @Field(() => String)
  @Property({ type: 'date' })
  created = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updated = new Date();

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }
}