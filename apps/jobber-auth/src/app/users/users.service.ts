import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import * as schema from './schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly database: NodePgDatabase<typeof schema>
  ) {}

  async getUsers() {
    return this.database.query.users.findMany();
  }

  async createUser(user: typeof schema.users.$inferInsert) {
    const [createdUser] = await this.database
      .insert(schema.users)
      .values({
        ...user,
        password: await hash(user.password, 10),
      })
      .returning();
    return createdUser;
  }
}
