import { Migration } from '@mikro-orm/migrations';

export class Migration20220415232419 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "item" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" text not null, "cost" int not null, "description" text not null);');
  }

}
