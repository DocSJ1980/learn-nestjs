import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginInput } from './dto/login.input';
import { User } from '../users/models/user.model';
import { Response } from 'express';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn<Promise<User>, [LoginInput, Response]>(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn<Promise<User>, [LoginInput, Response]>(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('login', () => {
    it('should return a token payload on successful login', async () => {
      const loginInput: LoginInput = {
        email: 'testuser@example.com',
        password: 'testpassword',
      };
      const expectedUser: User = {
        id: 1,
        email: 'testuser@example.com',
        password: 'testpassword', // Added password property
      };
      const mockResponse = {} as Response;

      jest.spyOn(authService, 'login').mockResolvedValue(expectedUser);

      const result = await resolver.login(loginInput, {
        res: mockResponse,
      } as any);
      expect(result).toEqual(expectedUser);
      expect(authService.login).toHaveBeenCalledWith(loginInput, mockResponse);
    });

    it('should throw an error on failed login', async () => {
      const loginInput: LoginInput = {
        email: 'wronguser@example.com',
        password: 'wrongpassword',
      };
      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        resolver.login(loginInput, { res: {} as Response } as any)
      ).rejects.toThrow('Invalid credentials');
      expect(authService.login).toHaveBeenCalledWith(
        loginInput,
        {} as Response
      );
    });
  });
});
