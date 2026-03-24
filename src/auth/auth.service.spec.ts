import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedpassword'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    id: 'user-123',
    username: 'kenkzuha',
    email: 'kenkzuha@gmail.com',
    password: '$2b$10$hashedpassword',
    createdAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto = {
      username: 'kenkzuha',
      email: 'kenkzuha@gmail.com',
      password: 'password123',
    };

    it('✅ should create a new user successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.signup(signupDto);

      expect(result).toEqual({ message: 'User Created Successfully' });
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('❌ should throw ConflictException if username already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        username: 'kenkzuha',
      });

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
      await expect(service.signup(signupDto)).rejects.toThrow('Username field is already registered');
    });

    it('❌ should throw ConflictException if email already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        username: 'differentuser',
        email: 'kenkzuha@gmail.com',
      });

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
      await expect(service.signup(signupDto)).rejects.toThrow('Email field is already registered');
    });

    it('✅ should hash the password before saving', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await service.signup(signupDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10); 
    });
  });

  describe('login', () => {
    const loginDto = {
      username: 'kenkzuha',
      password: 'password123',
    };

    it('✅ should login successfully and return access_token', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock.jwt.token');

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('mock.jwt.token');
      expect(result.message).toBe('Login Successfully');
      expect(result.user).not.toHaveProperty('password');
    });

    it('❌ should throw UnauthorizedException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid Credentials');
    });

    it('❌ should throw if password is wrong', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow('Invalid Credentials');
    });

    it('✅ should not return password in response', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock.jwt.token');

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('✅ should call signAsync with correct payload', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mock.jwt.token');

      await service.login(loginDto);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        username: mockUser.username,
      });
    });
  });
});