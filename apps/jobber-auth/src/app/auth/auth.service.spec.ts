import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';

// Mock implementations
const mockUsersService = {
  getUser: jest.fn(),
};

const mockConfigService = {
  getOrThrow: jest.fn((key: string) => {
    if (key === 'AUTH_JWT_EXPIRATION_MS') return '3600000'; // 1 hour
    return '';
  }),
  get: jest.fn((key: string) => {
    if (key === 'NODE_ENV') return 'development';
    return '';
  }),
};

const mockJwtService = {
  sign: jest.fn(() => 'mockAccessToken'),
};

// Mock bcrypt.compare
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let configService: ConfigService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    configService = module.get<ConfigService>(ConfigService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedPassword',
    };
    const loginInput = { email: 'test@example.com', password: 'password123' };
    const mockResponse = {
      cookie: jest.fn(),
    } as unknown as Response;

    it('should successfully log in a user and set a cookie', async () => {
      mockUsersService.getUser.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginInput, mockResponse);

      expect(usersService.getUser).toHaveBeenCalledWith({
        email: loginInput.email,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        mockUser.password
      );
      expect(jwtService.sign).toHaveBeenCalledWith({ userId: mockUser.id });
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'Authentication',
        'mockAccessToken',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          expires: expect.any(Date),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUsersService.getUser.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginInput, mockResponse)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.getUser.mockRejectedValue(new UnauthorizedException());
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // This won't be called if user is null

      await expect(service.login(loginInput, mockResponse)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockResponse.cookie).not.toHaveBeenCalled();
    });
  });
});
