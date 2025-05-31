import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { DATABASE_CONNECTION } from '../database/database-connection';
import { users } from './schema';
import { hash } from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
}));

describe('UsersService', () => {
  let service: UsersService;
  let database: NodePgDatabase<typeof schema>;
  let mockReturning: jest.Mock;
  let mockValues: jest.Mock;
  let mockInsert: jest.Mock;

  beforeEach(async () => {
    const mockUsers = [
      { id: 1, username: 'testuser', password: 'hashed_password' },
    ];

    mockReturning = jest.fn().mockResolvedValue([mockUsers[0]]);
    mockValues = jest.fn(() => ({
      returning: mockReturning,
    }));
    mockInsert = jest.fn(() => ({
      values: mockValues,
    }));

    const mockDatabase = {
      query: {
        users: {
          findMany: jest.fn().mockResolvedValue(mockUsers),
        },
      },
      insert: mockInsert,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    database = module.get<NodePgDatabase<typeof schema>>(DATABASE_CONNECTION);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const result = await service.getUsers();
      expect(result).toEqual([
        { id: 1, username: 'testuser', password: 'hashed_password' },
      ]);
      expect(database.query.users.findMany).toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const newUser = { username: 'newuser', password: 'password123' };
      const createdUser = await service.createUser(newUser);

      expect(createdUser).toEqual({
        id: 1,
        username: 'testuser',
        password: 'hashed_password',
      });
      expect(database.insert).toHaveBeenCalledWith(schema.users);
      expect(mockValues).toHaveBeenCalledWith({
        ...newUser,
        password: await hash(newUser.password, 10),
      });
      expect(mockReturning).toHaveBeenCalled();
    });
  });
});
