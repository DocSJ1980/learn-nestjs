import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from '../database/database-connection';
import * as schema from './schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { hash } from 'bcryptjs';
import { eq, or } from 'drizzle-orm';

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

  async getUser(args: Partial<typeof schema.users.$inferSelect>) {
    if (!args.id && !args.email) {
      throw new Error('Must provide either id or email');
    }

    // Handle each case explicitly
    if (args.id && args.email) {
      return this.database.query.users.findFirst({
        where: or(
          eq(schema.users.id, args.id),
          eq(schema.users.email, args.email)
        ),
      });
    }

    if (args.id) {
      return this.database.query.users.findFirst({
        where: eq(schema.users.id, args.id),
      });
    }

    if (args.email) {
      return this.database.query.users.findFirst({
        where: eq(schema.users.email, args.email),
      });
    }
  }
}
