import { Migration } from '@mikro-orm/migrations';

export class Migration20220517185428 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" serial primary key, "username" text not null, "password" text not null, "current_order_id" int not null, "is_ordering" boolean not null, "created" timestamptz(0) not null, "updated" timestamptz(0) not null);');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');

    this.addSql('create table "product" ("id" serial primary key, "name" text not null, "cost" int not null, "created" timestamptz(0) not null, "updated" timestamptz(0) not null);');

    this.addSql('create table "order" ("id" serial primary key, "user_id" int not null, "created" timestamptz(0) not null, "updated" timestamptz(0) not null);');

    this.addSql('create table "item" ("order_id" int not null, "product_id" int not null, "quantity" int not null, "created" timestamptz(0) not null, "updated" timestamptz(0) not null);');
    this.addSql('alter table "item" add constraint "item_pkey" primary key ("order_id", "product_id");');

    this.addSql('alter table "order" add constraint "order_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "item" add constraint "item_order_id_foreign" foreign key ("order_id") references "order" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "item" add constraint "item_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "order" drop constraint "order_user_id_foreign";');

    this.addSql('alter table "item" drop constraint "item_product_id_foreign";');

    this.addSql('alter table "item" drop constraint "item_order_id_foreign";');

    this.addSql('drop table if exists "user" cascade;');

    this.addSql('drop table if exists "product" cascade;');

    this.addSql('drop table if exists "order" cascade;');

    this.addSql('drop table if exists "item" cascade;');
  }

}
