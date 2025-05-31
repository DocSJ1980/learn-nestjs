import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getUsers: jest.fn(),
    createUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return an array of users', async () => {
      const result = [{ name: 'Test User' }];
      jest.spyOn(service, 'getUsers').mockResolvedValue(result as any);
      expect(await controller.getUsers()).toBe(result);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const result = { id: '1', ...createUserRequest };
      jest.spyOn(service, 'createUser').mockResolvedValue(result as any);
      expect(await controller.createUser(createUserRequest)).toBe(result);
    });
  });
});
